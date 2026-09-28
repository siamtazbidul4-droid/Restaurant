import { Router, Request, Response } from 'express';
import { ReservationService } from '../services/reservation.service.js';
import type { ReservationUpdateInput } from '../services/reservation.service.js';
import { Reservation } from '../models/Reservation.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  errorMessage,
  isIntegerInRange,
  isIsoDate,
  isText,
  isTimeString,
  isValidEmail,
  isValidPhone,
  pickAllowed,
} from '../utils/request.js';

const router = Router();

/** Fields an admin may change — anything else in the body is ignored. */
const EDITABLE_FIELDS = [
  'date',
  'time',
  'guests',
  'name',
  'email',
  'phone',
  'specialRequest',
  'seatingPreference',
  'dietaryRequirements',
  'status',
  'source',
  'table',
  'durationMinutes',
  'internalNotes',
] as const;

// GET /api/reservations/availability?date=YYYY-MM-DD&guests=2
router.get('/availability', async (req: Request, res: Response) => {
  try {
    const { date, guests } = req.query;

    if (!date || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Date (YYYY-MM-DD) and guest count are required.',
      });
    }

    const guestNum = parseInt(guests as string, 10);
    if (isNaN(guestNum) || guestNum < 1) {
      return res.status(400).json({ success: false, message: 'Invalid guest count.' });
    }

    const result = await ReservationService.checkAvailability(date as string, guestNum);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reservations (Public guest booking)
router.post('/', simpleRateLimit(20, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { date, time, guests, name, email, phone, specialRequest, seatingPreference, dietaryRequirements } = req.body;

    if (!date || !time || !guests || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields (date, time, guests, name, email, phone).',
      });
    }

    if (!isText(name, 2, 120)) {
      return res.status(400).json({ success: false, message: 'Please enter the name for the reservation.' });
    }
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Please enter a valid email address so we can confirm your booking.' });
    }
    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid contact phone number.' });
    }
    if (!isIsoDate(date)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid reservation date (YYYY-MM-DD).' });
    }
    if (!isTimeString(time)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid reservation time.' });
    }
    if (!isIntegerInRange(guests, 1, 20)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid party size (1-20 guests).' });
    }
    if (specialRequest !== undefined && specialRequest !== '' && !isText(specialRequest, 1, 1000)) {
      return res.status(400).json({ success: false, message: 'Special requests must be under 1000 characters.' });
    }
    if (seatingPreference !== undefined && !isText(seatingPreference, 1, 120)) {
      return res.status(400).json({ success: false, message: 'The seating preference is too long.' });
    }

    const guestNum = Number(guests);

    const safeDietaryRequirements: string[] = Array.isArray(dietaryRequirements)
      ? dietaryRequirements
          .filter((item: unknown) => typeof item === 'string')
          .slice(0, 20)
          .map((item: string) => item.trim().slice(0, 120))
      : [];

    const reservation = await ReservationService.createReservation({
      date,
      time,
      guests: guestNum,
      name,
      email,
      phone,
      specialRequest,
      seatingPreference,
      dietaryRequirements: safeDietaryRequirements,
      source: 'Website',
      status: 'Confirmed',
    });

    res.status(201).json({
      success: true,
      message: 'Your table reservation has been confirmed.',
      data: {
        reference: reservation.reference,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        name: reservation.name,
        status: reservation.status,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/reservations/lookup/:reference (Public status check)
router.get('/lookup/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const reservation = await ReservationService.getReservationByReference(reference);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation found with reference code "${reference.toUpperCase()}".`,
      });
    }

    res.json({ success: true, data: reservation });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reservations/lookup/:reference/cancel (Public guest cancellation)
router.post('/lookup/:reference/cancel', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const { reason } = req.body;

    const reservation = await ReservationService.cancelReservation(reference, reason, 'Guest via Portal');
    res.json({
      success: true,
      message: 'Your reservation has been cancelled.',
      data: {
        reference: reservation.reference,
        status: reservation.status,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin Protected Routes
// GET /api/reservations/admin/all
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, status, search, page = '1', limit = '50' } = req.query;
    const filter: any = {};

    if (date) {
      filter.date = date;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { reference: regex }];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .populate('table')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reservations/admin (Admin manual reservation creation)
router.post('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, time, guests, name, email, phone, specialRequest, seatingPreference, source, tableId, status } =
      req.body;

    const reservation = await ReservationService.createReservation({
      date,
      time,
      guests: Number(guests),
      name,
      email,
      phone,
      specialRequest,
      seatingPreference,
      source: source || 'Admin',
      status: status || 'Confirmed',
      tableId,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation recorded successfully.',
      data: reservation,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/reservations/admin/:id (Admin update)
router.put('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Whitelist editable fields — never pass the raw request body to MongoDB
    // (prevents mass assignment of protected fields such as reference/_id).
    const update = pickAllowed(req.body, EDITABLE_FIELDS) as ReservationUpdateInput;

    // Re-runs the booking rules (party capacity + table conflict detection)
    // behind the same mutex as guest bookings, so an admin edit can never
    // double-book a table.
    const updated = await ReservationService.updateReservation(id, update);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'RESERVATION_UPDATED',
      resource: 'Reservation',
      resourceId: id,
      metadata: update,
    });

    res.json({
      success: true,
      message: 'Reservation updated.',
      data: updated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: errorMessage(err) });
  }
});

// DELETE /api/reservations/admin/:id
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Reservation.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'RESERVATION_DELETED',
      resource: 'Reservation',
      resourceId: id,
      metadata: { reference: deleted.reference },
    });

    res.json({ success: true, message: 'Reservation deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
