import { PrivateEventInquiry, IPrivateEventInquiry } from '../models/PrivateEventInquiry.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

export class EventsService {
  static async createInquiry(data: Partial<IPrivateEventInquiry>) {
    const inquiry = await PrivateEventInquiry.create(data);

    await Notification.create({
      title: 'Private Event Inquiry',
      message: `${data.name} submitted an inquiry for ${data.eventType} (${data.guestCount} guests) on ${data.preferredDate}`,
      type: 'event',
      link: `/admin/events?id=${inquiry._id}`,
    });

    await AuditLog.create({
      actor: data.email || 'Customer',
      action: 'EVENT_INQUIRY_CREATED',
      resource: 'PrivateEventInquiry',
      resourceId: inquiry._id.toString(),
      metadata: { eventType: data.eventType, guestCount: data.guestCount },
    });

    return inquiry;
  }

  static async getInquiries(status?: string) {
    const filter = status && status !== 'all' ? { status } : {};
    return PrivateEventInquiry.find(filter).sort({ createdAt: -1 });
  }

  static async updateInquiryStatus(id: string, status: string, internalNotes?: string, actor = 'Admin') {
    const updateData: any = { status };
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }
    const updated = await PrivateEventInquiry.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) throw new Error('Inquiry not found');

    await AuditLog.create({
      actor,
      action: 'EVENT_INQUIRY_STATUS_UPDATED',
      resource: 'PrivateEventInquiry',
      resourceId: id,
      metadata: { status, internalNotes },
    });

    return updated;
  }

  static async deleteInquiry(id: string, actor = 'Admin') {
    const deleted = await PrivateEventInquiry.findByIdAndDelete(id);
    await AuditLog.create({
      actor,
      action: 'EVENT_INQUIRY_DELETED',
      resource: 'PrivateEventInquiry',
      resourceId: id,
    });
    return deleted;
  }
}
