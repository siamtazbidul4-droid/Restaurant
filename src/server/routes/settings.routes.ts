import { Router, Request, Response } from 'express';
import { RestaurantSettings } from '../models/RestaurantSettings.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { AuditLog } from '../models/AuditLog.js';
import { pickAllowed, errorMessage } from '../utils/request.js';

const router = Router();

/**
 * Fields the admin settings screen is allowed to persist.
 *
 * `cloudinaryConfig` is intentionally absent: media credentials come from the
 * environment (CLOUDINARY_*), and accepting it here would let any authenticated
 * request overwrite the stored Cloudinary API secret.
 */
const EDITABLE_FIELDS = [
  'restaurantName',
  'tagline',
  'description',
  'heroHeadline',
  'heroSubheadline',
  'logo',
  'favicon',
  'phone',
  'email',
  'address',
  'city',
  'postalCode',
  'country',
  'mapUrl',
  'latitude',
  'longitude',
  'parkingInformation',
  'dressCode',
  'openingHours',
  'currency',
  'currencySymbol',
  'timezone',
  'defaultReservationDuration',
  'maxPartySizeOnline',
  'minAdvanceNoticeHours',
  'maxAdvanceNoticeDays',
  'reservationPolicy',
  'cancellationPolicy',
  'socialLinks',
  'blockedDates',
] as const;

// Public: GET /api/settings
router.get('/', async (req: Request, res: Response) => {
  try {
    // Never expose media credentials (cloud name / key / secret) publicly.
    const settings = await RestaurantSettings.findOne().select('-cloudinaryConfig');
    if (!settings) {
      return res.status(404).json({ success: false, message: 'Settings not initialized' });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: errorMessage(err) });
  }
});

// Admin: PUT /api/settings
router.put('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const payload = pickAllowed(req.body, EDITABLE_FIELDS);

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(payload);
    } else {
      Object.assign(settings, payload);
      await settings.save();
    }

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'SETTINGS_UPDATED',
      resource: 'RestaurantSettings',
      resourceId: settings._id.toString(),
      metadata: { restaurantName: settings.restaurantName },
    });

    const sanitized = await RestaurantSettings.findById(settings._id).select('-cloudinaryConfig');

    res.json({
      success: true,
      message: 'Restaurant settings updated successfully.',
      data: sanitized,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: errorMessage(err) });
  }
});

export default router;

