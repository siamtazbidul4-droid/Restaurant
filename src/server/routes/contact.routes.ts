import { Router, Request, Response } from 'express';
import { ContactService } from '../services/contact.service.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Validation helper for clean email strings
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 150 && !/[\r\n]/.test(email);
}

// Public: POST /api/contact
router.post('/', simpleRateLimit(10, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid patron name (2 to 100 characters).',
      });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 2 || subject.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an inquiry subject (2 to 200 characters).',
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.length > 3000) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message body (5 to 3000 characters).',
      });
    }

    // Header injection prevention: no CRLF in single-line fields
    if (/[\r\n]/.test(name) || /[\r\n]/.test(subject) || (phone && /[\r\n]/.test(phone))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid characters detected in input fields.',
      });
    }

    const clientIp = (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '').trim();

    const { contact, emailResult } = await ContactService.createMessage(
      {
        name,
        email,
        phone,
        subject,
        message,
      },
      clientIp
    );

    let confirmationMessage = 'Thank you for reaching out. Your message has been received by our concierge host team.';
    if (emailResult.success) {
      confirmationMessage = 'Thank you for reaching out. Your message has been dispatched to our concierge team.';
    }

    res.status(201).json({
      success: true,
      message: confirmationMessage,
      data: {
        id: contact._id,
        emailDeliveryStatus: contact.emailDeliveryStatus,
        createdAt: contact.createdAt,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: GET /api/contact/admin
router.get('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await ContactService.getMessages(req.query.status as string);
    res.json({ success: true, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: PUT /api/contact/admin/:id
router.put('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, internalNotes } = req.body;
    const updated = await ContactService.updateMessageStatus(req.params.id, status, internalNotes, req.user?.email);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: DELETE /api/contact/admin/:id
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await ContactService.deleteMessage(req.params.id, req.user?.email);
    res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
