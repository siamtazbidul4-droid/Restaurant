import { Router, Response } from 'express';
import { Reservation } from '../models/Reservation.js';
import { PrivateEventInquiry } from '../models/PrivateEventInquiry.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { MenuItem } from '../models/MenuItem.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken);

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeek = nextWeekDate.toISOString().split('T')[0];

    const [
      todayReservationsCount,
      pendingReservationsCount,
      upcomingReservationsCount,
      newEventInquiriesCount,
      unreadContactMessagesCount,
      totalMenuItemsCount,
      recentAuditLogs,
    ] = await Promise.all([
      Reservation.countDocuments({ date: today, status: { $nin: ['Cancelled', 'No-show'] } }),
      Reservation.countDocuments({ status: 'Pending' }),
      Reservation.countDocuments({
        date: { $gte: today, $lte: nextWeek },
        status: { $nin: ['Cancelled', 'No-show'] },
      }),
      PrivateEventInquiry.countDocuments({ status: 'New' }),
      ContactMessage.countDocuments({ status: 'New' }),
      MenuItem.countDocuments({ isPublished: true }),
      AuditLog.find().sort({ timestamp: -1 }).limit(10),
    ]);

    res.json({
      success: true,
      data: {
        todayReservationsCount,
        pendingReservationsCount,
        upcomingReservationsCount,
        newEventInquiriesCount,
        unreadContactMessagesCount,
        totalMenuItemsCount,
        recentActivity: recentAuditLogs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Notifications
// GET /api/admin/notifications
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/notifications/:id/read
router.put('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/notifications/read-all
router.put('/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Audit Logs
// GET /api/admin/audit-logs
router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const { resource, page = '1', limit = '50' } = req.query;
    const filter: any = {};
    if (resource && resource !== 'all') {
      filter.resource = resource;
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: logs,
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

export default router;
