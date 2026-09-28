import { Router, Request, Response } from 'express';
import { EventsService } from '../services/events.service.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { simpleRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Public: POST /api/events/inquire
router.post('/inquire', simpleRateLimit(15, 60 * 1000), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, eventType, guestCount, preferredDate, preferredTime, budgetRange, specialRequirements, message } = req.body;

    if (!name || !phone || !email || !eventType || !guestCount || !preferredDate || !preferredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, phone, email, event type, guest count, date, and time.',
      });
    }

    const inquiry = await EventsService.createInquiry({
      name,
      phone,
      email,
      eventType,
      guestCount: Number(guestCount),
      preferredDate,
      preferredTime,
      budgetRange,
      specialRequirements,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Your private dining inquiry has been received. Our Event Director will reach out within 24 hours.',
      data: inquiry,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: GET /api/events/admin
router.get('/admin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const inquiries = await EventsService.getInquiries(req.query.status as string);
    res.json({ success: true, data: inquiries });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: PUT /api/events/admin/:id
router.put('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, internalNotes } = req.body;
    const updated = await EventsService.updateInquiryStatus(req.params.id, status, internalNotes, req.user?.email);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: DELETE /api/events/admin/:id
router.delete('/admin/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await EventsService.deleteInquiry(req.params.id, req.user?.email);
    res.json({ success: true, message: 'Event inquiry removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
