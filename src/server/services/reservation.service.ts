import mongoose from 'mongoose';
import { Reservation, IReservation } from '../models/Reservation.js';
import { DiningTable, IDiningTable } from '../models/DiningTable.js';
import { RestaurantSettings, IOpeningDay } from '../models/RestaurantSettings.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

/** Statuses that do not occupy a table. */
const INACTIVE_STATUSES = ['Cancelled', 'No-show'];

type ReservationStatus = IReservation['status'];
type ReservationSource = IReservation['source'];

/** Editable fields accepted by the admin update endpoint. */
export interface ReservationUpdateInput {
  date?: string;
  time?: string;
  guests?: number;
  name?: string;
  email?: string;
  phone?: string;
  specialRequest?: string;
  seatingPreference?: string;
  dietaryRequirements?: string[];
  status?: ReservationStatus;
  source?: ReservationSource;
  table?: string | null;
  durationMinutes?: number;
  internalNotes?: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Half-open interval overlap test used by every conflict check. */
function hasTimeOverlap(
  existingStart: number,
  existingEnd: number,
  targetStart: number,
  targetEnd: number
): boolean {
  return targetStart < existingEnd && targetEnd > existingStart;
}

export function getTodayInTimezone(tz = 'America/New_York'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function generateReservationReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AURL-${code}`;
}

export class ReservationService {
  // In-process mutex that serializes the conflict-check → create window in
  // createReservation. The API runs single-instance (Render), so a module-level
  // promise chain eliminates the check-then-create double-booking race without
  // a transaction refactor. If deployment ever becomes multi-instance, replace
  // this with a MongoDB transaction.
  private static assignmentQueue: Promise<unknown> = Promise.resolve();

  static async checkAvailability(date: string, guests: number) {
    // 1. Fetch restaurant settings to know timezone and rules
    const settings = await RestaurantSettings.findOne();
    if (!settings) {
      throw new Error('Restaurant settings are not initialized.');
    }

    const restaurantTimezone = settings.timezone || 'America/New_York';
    const todayInTz = getTodayInTimezone(restaurantTimezone);

    // 2. Validate date is not in the past
    if (!date || date < todayInTz) {
      return {
        available: false,
        reason: 'Reservations cannot be booked for past dates.',
        availableSlots: [],
      };
    }

    // 3. Blocked dates check
    if (settings.blockedDates?.includes(date)) {
      return {
        available: false,
        reason: 'The restaurant is closed for a private event or holiday on this date.',
        availableSlots: [],
      };
    }

    // 4. Online party size limits
    if (guests > settings.maxPartySizeOnline) {
      return {
        available: false,
        reason: `Online reservations are limited to parties of up to ${settings.maxPartySizeOnline}. For larger parties, please submit a Private Dining Inquiry.`,
        availableSlots: [],
      };
    }

    if (guests < 1) {
      return {
        available: false,
        reason: 'Party size must be at least 1 guest.',
        availableSlots: [],
      };
    }

    // 5. Check opening hours for day of week in target timezone
    const targetDate = new Date(`${date}T12:00:00Z`);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const dayName = daysOfWeek[targetDate.getUTCDay()];
    const daySchedule = settings.openingHours.find((h: IOpeningDay) => h.day === dayName);

    if (!daySchedule || daySchedule.isClosed) {
      return {
        available: false,
        reason: `The restaurant is closed on ${dayName}s.`,
        availableSlots: [],
      };
    }

    const openMin = parseTimeToMinutes(daySchedule.openTime || '17:30');
    const closeMin = parseTimeToMinutes(daySchedule.closeTime || '23:00');
    const duration = settings.defaultReservationDuration || 90;

    // 6. Retrieve candidate active tables that can seat `guests`
    const candidateTables = await DiningTable.find({
      isActive: true,
      capacity: { $gte: guests },
    }).sort({ capacity: 1 });

    if (candidateTables.length === 0) {
      return {
        available: false,
        reason: `No dining tables currently accommodate a party of ${guests}.`,
        availableSlots: [],
      };
    }

    // 7. Retrieve existing non-cancelled reservations on this date
    const existingReservations = await Reservation.find({
      date,
      status: { $nin: ['Cancelled', 'No-show'] },
    });

    // 8. Generate time slots (30-minute cadence)
    const availableSlots: string[] = [];
    const lastSeatingMin = closeMin - duration;

    for (let slotMin = openMin; slotMin <= lastSeatingMin; slotMin += 30) {
      const slotTimeStr = formatMinutesToTime(slotMin);
      const slotEndMin = slotMin + duration;

      // Find at least one table that has no conflict during [slotMin, slotEndMin]
      const freeTable = candidateTables.find((table) => {
        const hasConflict = existingReservations.some((res) => {
          if (res.table && res.table.toString() === table._id.toString()) {
            const resStart = parseTimeToMinutes(res.time);
            const resEnd = resStart + (res.durationMinutes || duration);
            return slotMin < resEnd && slotEndMin > resStart;
          }
          return false;
        });
        return !hasConflict;
      });

      if (freeTable) {
        availableSlots.push(slotTimeStr);
      }
    }

    return {
      available: availableSlots.length > 0,
      reason: availableSlots.length > 0 ? undefined : 'All tables are fully committed for this date.',
      availableSlots,
      daySchedule: {
        day: dayName,
        open: daySchedule.openTime,
        close: daySchedule.closeTime,
      },
    };
  }

  static async createReservation(data: {
    date: string;
    time: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
    specialRequest?: string;
    seatingPreference?: string;
    dietaryRequirements?: string[];
    source?: 'Website' | 'Phone' | 'Walk-in' | 'Admin';
    status?: 'Pending' | 'Confirmed';
    tableId?: string;
  }) {
    // Serialize creation so two concurrent bookings cannot double-book the same
    // table/time (see assignmentQueue note above).
    const run = this.assignmentQueue.then(
      () => this.performCreateReservation(data),
      () => this.performCreateReservation(data)
    );
    this.assignmentQueue = run.catch(() => undefined);
    return run;
  }

  private static async performCreateReservation(data: {
    date: string;
    time: string;
    guests: number;
    name: string;
    email: string;
    phone: string;
    specialRequest?: string;
    seatingPreference?: string;
    dietaryRequirements?: string[];
    source?: 'Website' | 'Phone' | 'Walk-in' | 'Admin';
    status?: 'Pending' | 'Confirmed';
    tableId?: string;
  }) {
    const settings = await RestaurantSettings.findOne();
    if (!settings) {
      throw new Error('Restaurant settings are not configured.');
    }

    const duration = settings.defaultReservationDuration || 90;
    const targetMin = parseTimeToMinutes(data.time);
    const targetEndMin = targetMin + duration;

    // Verify date is not in the past
    const todayInTz = getTodayInTimezone(settings.timezone || 'America/New_York');
    if (data.date < todayInTz) {
      throw new Error('Reservations cannot be booked for past dates.');
    }

    // Verify day is not closed
    const targetDate = new Date(`${data.date}T12:00:00Z`);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const dayName = daysOfWeek[targetDate.getUTCDay()];
    const daySchedule = settings.openingHours.find((h: IOpeningDay) => h.day === dayName);

    if (!daySchedule || daySchedule.isClosed) {
      throw new Error(`The restaurant is closed for service on ${dayName}s.`);
    }

    let assignedTableId = data.tableId;

    if (assignedTableId) {
      // Validate explicitly assigned table
      const assignedTable = await DiningTable.findById(assignedTableId);
      if (!assignedTable || !assignedTable.isActive) {
        throw new Error('The selected dining table is inactive or does not exist.');
      }
      if (assignedTable.capacity < data.guests) {
        throw new Error(`Table ${assignedTable.tableNumber} accommodates ${assignedTable.capacity} guests, which is insufficient for party of ${data.guests}.`);
      }

      // Check conflict on explicitly assigned table
      const existingOnTable = await Reservation.find({
        date: data.date,
        table: assignedTableId,
        status: { $nin: ['Cancelled', 'No-show'] },
      });

      const hasConflict = existingOnTable.some((res) => {
        const resStart = parseTimeToMinutes(res.time);
        const resEnd = resStart + (res.durationMinutes || duration);
        return targetMin < resEnd && targetEndMin > resStart;
      });

      if (hasConflict) {
        throw new Error(`Table ${assignedTable.tableNumber} is already committed during this time interval.`);
      }
    } else {
      // Auto-assign best matching table
      const candidateTables = await DiningTable.find({
        isActive: true,
        capacity: { $gte: data.guests },
      }).sort({ capacity: 1 });

      if (candidateTables.length === 0) {
        throw new Error(`No available table configuration accommodates ${data.guests} guests.`);
      }

      const existingReservations = await Reservation.find({
        date: data.date,
        status: { $nin: ['Cancelled', 'No-show'] },
      });

      const freeTable = candidateTables.find((table) => {
        const hasConflict = existingReservations.some((res) => {
          if (res.table && res.table.toString() === table._id.toString()) {
            const resStart = parseTimeToMinutes(res.time);
            const resEnd = resStart + (res.durationMinutes || duration);
            return targetMin < resEnd && targetEndMin > resStart;
          }
          return false;
        });
        return !hasConflict;
      });

      if (!freeTable) {
        throw new Error('This time slot has been fully booked. Please select another time or date.');
      }

      assignedTableId = freeTable._id.toString();
    }

    // Generate unique reference
    let reference = generateReservationReference();
    let collision = await Reservation.findOne({ reference });
    while (collision) {
      reference = generateReservationReference();
      collision = await Reservation.findOne({ reference });
    }

    const reservation = await Reservation.create({
      reference,
      date: data.date,
      time: data.time,
      durationMinutes: duration,
      guests: data.guests,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      specialRequest: data.specialRequest || '',
      seatingPreference: data.seatingPreference || 'Any',
      dietaryRequirements: data.dietaryRequirements || [],
      status: data.status || 'Confirmed',
      source: data.source || 'Website',
      table: assignedTableId,
    });

    // In-app Notification for Admin
    await Notification.create({
      title: 'New Table Reservation',
      message: `${data.name} booked a table for ${data.guests} guests on ${data.date} at ${data.time} (${reference})`,
      type: 'reservation',
      link: `/admin/reservations?ref=${reference}`,
      metadata: { reservationId: reservation._id, reference },
    });

    // Audit log
    await AuditLog.create({
      actor: data.source === 'Admin' ? 'Admin' : data.email,
      action: 'RESERVATION_CREATED',
      resource: 'Reservation',
      resourceId: reservation._id.toString(),
      metadata: { reference, date: data.date, time: data.time, guests: data.guests, tableId: assignedTableId },
    });

    return reservation.populate('table');
  }

  static async getReservationByReference(reference: string) {
    const res = await Reservation.findOne({ reference: reference.toUpperCase().trim() }).populate('table');
    if (!res) {
      return null;
    }
    return {
      reference: res.reference,
      date: res.date,
      time: res.time,
      guests: res.guests,
      name: res.name,
      status: res.status,
      seatingPreference: res.seatingPreference,
      specialRequest: res.specialRequest,
      dietaryRequirements: res.dietaryRequirements,
      createdAt: res.createdAt,
    };
  }

  static async cancelReservation(reference: string, reason?: string, actor = 'Customer') {
    const reservation = await Reservation.findOne({ reference: reference.toUpperCase().trim() });
    if (!reservation) {
      throw new Error('Reservation reference not found.');
    }

    if (reservation.status === 'Cancelled') {
      throw new Error('This reservation has already been cancelled.');
    }

    reservation.status = 'Cancelled';
    reservation.cancellationReason = reason || 'Cancelled by guest request';
    await reservation.save();

    await Notification.create({
      title: 'Reservation Cancelled',
      message: `Reservation ${reservation.reference} for ${reservation.name} on ${reservation.date} was cancelled.`,
      type: 'reservation',
      link: `/admin/reservations?ref=${reservation.reference}`,
    });

    await AuditLog.create({
      actor,
      action: 'RESERVATION_CANCELLED',
      resource: 'Reservation',
      resourceId: reservation._id.toString(),
      metadata: { reference: reservation.reference, reason },
    });

    return reservation;
  }

  /**
   * Admin edit of an existing reservation.
   *
   * Runs through the same assignment mutex as createReservation and re-applies
   * the booking capacity + table-conflict rules, so moving a party to another
   * date/time/table can never silently double-book a table.
   * Returns null when the reservation id does not exist.
   */
  static async updateReservation(
    id: string,
    updates: ReservationUpdateInput
  ): Promise<IReservation | null> {
    const run = this.assignmentQueue.then(
      () => this.performUpdateReservation(id, updates),
      () => this.performUpdateReservation(id, updates)
    );
    this.assignmentQueue = run.catch(() => undefined);
    return run;
  }

  private static async performUpdateReservation(
    id: string,
    updates: ReservationUpdateInput
  ): Promise<IReservation | null> {
    const reservation = await Reservation.findById(id);
    if (!reservation) return null;

    const settings = await RestaurantSettings.findOne();
    if (!settings) {
      throw new Error('Restaurant settings are not configured.');
    }

    const defaultDuration = settings.defaultReservationDuration || 90;

    const nextDate = updates.date ?? reservation.date;
    const nextTime = updates.time ?? reservation.time;
    const nextGuests = updates.guests ?? reservation.guests;
    const nextDuration = updates.durationMinutes ?? reservation.durationMinutes ?? defaultDuration;
    const nextStatus = updates.status ?? reservation.status;
    const requestedTableId =
      updates.table !== undefined ? updates.table : reservation.table?.toString() ?? '';

    if (!Number.isInteger(nextGuests) || nextGuests < 1) {
      throw new Error('Party size must be a whole number of at least 1 guest.');
    }
    if (nextDuration < 15 || nextDuration > 480) {
      throw new Error('Seating duration must be between 15 and 480 minutes.');
    }

    // A cancelled / no-show booking holds no table, so it can be edited freely.
    if (!INACTIVE_STATUSES.includes(nextStatus)) {
      const todayInTz = getTodayInTimezone(settings.timezone || 'America/New_York');
      if (nextDate < todayInTz) {
        throw new Error('Reservations cannot be moved to a past date.');
      }

      const targetStart = parseTimeToMinutes(nextTime);
      const targetEnd = targetStart + nextDuration;

      // Everything already occupying the floor that day, excluding this booking.
      const committed = await Reservation.find({
        date: nextDate,
        _id: { $ne: reservation._id },
        status: { $nin: INACTIVE_STATUSES },
      }).select('table time durationMinutes reference');

      const clashesWith = (tableId: string) =>
        committed.find((other) => {
          if (!other.table || other.table.toString() !== tableId) return false;
          const otherStart = parseTimeToMinutes(other.time);
          return hasTimeOverlap(
            otherStart,
            otherStart + (other.durationMinutes || defaultDuration),
            targetStart,
            targetEnd
          );
        });
      if (requestedTableId) {
        if (!mongoose.Types.ObjectId.isValid(requestedTableId)) {
          throw new Error('A valid dining table must be selected.');
        }

        const table = await DiningTable.findById(requestedTableId);
        if (!table || !table.isActive) {
          throw new Error('The selected dining table is inactive or does not exist.');
        }
        if (table.capacity < nextGuests) {
          throw new Error(
            `Table ${table.tableNumber} accommodates ${table.capacity} guests, which is insufficient for a party of ${nextGuests}.`
          );
        }

        const clash = clashesWith(table._id.toString());
        if (clash) {
          throw new Error(
            `Table ${table.tableNumber} is already committed at ${nextTime} by reservation ${clash.reference}.`
          );
        }

        reservation.table = table._id;
      } else {
        const candidateTables = await DiningTable.find({
          isActive: true,
          capacity: { $gte: nextGuests },
        }).sort({ capacity: 1 });

        if (candidateTables.length === 0) {
          throw new Error(`No available table configuration accommodates ${nextGuests} guests.`);
        }

        const freeTable = candidateTables.find((table) => !clashesWith(table._id.toString()));
        if (!freeTable) {
          throw new Error(
            'No table is free for the new time slot. Choose another time or assign a specific table.'
          );
        }

        reservation.table = freeTable._id;
      }
    }

    reservation.date = nextDate;
    reservation.time = nextTime;
    reservation.guests = nextGuests;
    reservation.durationMinutes = nextDuration;
    reservation.status = nextStatus;

    if (updates.name !== undefined) reservation.name = String(updates.name).trim();
    if (updates.email !== undefined) reservation.email = String(updates.email).trim().toLowerCase();
    if (updates.phone !== undefined) reservation.phone = String(updates.phone).trim();
    if (updates.specialRequest !== undefined) reservation.specialRequest = updates.specialRequest;
    if (updates.seatingPreference !== undefined) {
      reservation.seatingPreference = updates.seatingPreference;
    }
    if (updates.dietaryRequirements !== undefined) {
      reservation.dietaryRequirements = updates.dietaryRequirements;
    }
    if (updates.internalNotes !== undefined) reservation.internalNotes = updates.internalNotes;
    if (updates.source !== undefined) reservation.source = updates.source;

    if (updates.status === 'Cancelled' && !reservation.cancellationReason) {
      reservation.cancellationReason = 'Cancelled by admin';
    }

    await reservation.save();

    await Notification.create({
      title: 'Reservation Updated',
      message: `Reservation ${reservation.reference} (${reservation.name}) is now ${reservation.date} at ${reservation.time} for ${reservation.guests} guests — ${reservation.status}.`,
      type: 'reservation',
      link: `/admin/reservations?ref=${reservation.reference}`,
      metadata: { reservationId: reservation._id.toString(), reference: reservation.reference },
    });

    return reservation.populate('table');
  }
}
