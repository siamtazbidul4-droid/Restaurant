import { ContactMessage, IContactMessage } from '../models/ContactMessage.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { EmailService, EmailDeliveryResult } from './email.service.js';

export class ContactService {
  static async createMessage(
    data: {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    },
    ipAddress?: string
  ) {
    const adminRecipient = EmailService.getAdminRecipientEmail();

    // 1. Persist initial contact record to MongoDB
    const contact = await ContactMessage.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: (data.phone || '').trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'New',
      emailDeliveryStatus: 'pending',
      emailDeliveredTo: adminRecipient,
      ipAddress: ipAddress || '',
    });

    // 2. In-app staff notification in MongoDB
    await Notification.create({
      title: 'New Guest Concierge Message',
      message: `${data.name} sent message: "${data.subject}"`,
      type: 'contact',
      link: `/admin/contact?id=${contact._id}`,
      metadata: { contactId: contact._id, email: data.email },
    });

    // 3. Audit log
    await AuditLog.create({
      actor: data.email || 'Guest',
      action: 'CONTACT_MESSAGE_RECEIVED',
      resource: 'ContactMessage',
      resourceId: contact._id.toString(),
      metadata: { subject: data.subject, ipAddress },
    });

    // 4. Dispatch Email to server-side configured ADMIN_EMAIL
    let emailResult: EmailDeliveryResult = { success: false, notConfigured: false, error: undefined };
    try {
      emailResult = await EmailService.sendContactNotification({ // eslint-disable-line
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        submittedAt: contact.createdAt,
        ipAddress,
      });

      if (emailResult.success) {
        contact.emailDeliveryStatus = 'sent';
      } else if (emailResult.notConfigured) {
        contact.emailDeliveryStatus = 'not_configured';
        contact.emailError = 'EMAIL_API_KEY not configured on server';
      } else {
        contact.emailDeliveryStatus = 'failed';
        contact.emailError = emailResult.error || 'Provider rejection';
      }
      await contact.save();
    } catch (err: any) {
      console.error('[ContactService] Error updating delivery status:', err.message);
      contact.emailDeliveryStatus = 'failed';
      contact.emailError = err.message;
      await contact.save();
    }

    return {
      contact,
      emailResult,
    };
  }

  static async getMessages(status?: string) {
    const filter = status && status !== 'all' ? { status } : {};
    return ContactMessage.find(filter).sort({ createdAt: -1 });
  }

  static async updateMessageStatus(id: string, status: string, internalNotes?: string, actor = 'Admin') {
    const updateData: any = { status };
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }
    const updated = await ContactMessage.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) throw new Error('Message not found');

    await AuditLog.create({
      actor,
      action: 'CONTACT_MESSAGE_STATUS_UPDATED',
      resource: 'ContactMessage',
      resourceId: id,
      metadata: { status },
    });

    return updated;
  }

  static async deleteMessage(id: string, actor = 'Admin') {
    const deleted = await ContactMessage.findByIdAndDelete(id);
    await AuditLog.create({
      actor,
      action: 'CONTACT_MESSAGE_DELETED',
      resource: 'ContactMessage',
      resourceId: id,
    });
    return deleted;
  }
}
