import { Router, Request, Response } from 'express';
import { Chef } from '../models/Chef.js';
import { Experience } from '../models/Experience.js';
import { Testimonial } from '../models/Testimonial.js';
import { Announcement } from '../models/Announcement.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { AuditLog } from '../models/AuditLog.js';
import { pickAllowed } from '../utils/request.js';

const router = Router();

/**
 * Editable fields per collection. Requests are filtered through these lists so
 * protected keys (`_id`, `__v`, `reference`, payment fields…) can never be
 * mass-assigned from a request body.
 */
const CHEF_FIELDS = [
  'name',
  'position',
  'experience',
  'biography',
  'culinaryPhilosophy',
  'specialties',
  'image',
  'isPublished',
] as const;

const EXPERIENCE_FIELDS = [
  'title',
  'category',
  'description',
  'image',
  'ctaLabel',
  'ctaUrl',
  'sortOrder',
  'isPublished',
] as const;

const TESTIMONIAL_FIELDS = [
  'customerName',
  'roleOrAffiliation',
  'review',
  'rating',
  'date',
  'source',
  'avatar',
  'isPublished',
  'sortOrder',
] as const;

const ANNOUNCEMENT_FIELDS = [
  'title',
  'description',
  'image',
  'priority',
  'startDate',
  'endDate',
  'ctaLabel',
  'ctaUrl',
  'isPublished',
] as const;

const GALLERY_FIELDS = [
  'title',
  'altText',
  'caption',
  'category',
  'imageUrl',
  'publicId',
  'sortOrder',
  'isFeatured',
  'isPublished',
] as const;

// ==================== CHEF ====================
router.get('/chef', async (req: Request, res: Response) => {
  try {
    const chef = await Chef.findOne({ isPublished: true });
    res.json({ success: true, data: chef });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/chef', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let chef = await Chef.findOne();
    if (!chef) {
      chef = await Chef.create(pickAllowed(req.body, CHEF_FIELDS));
    } else {
      Object.assign(chef, pickAllowed(req.body, CHEF_FIELDS));
      await chef.save();
    }
    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'CHEF_UPDATED',
      resource: 'Chef',
      resourceId: chef._id.toString(),
    });
    res.json({ success: true, data: chef });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==================== EXPERIENCES ====================
router.get('/experiences', async (req: Request, res: Response) => {
  try {
    const onlyPublished = req.query.all !== 'true';
    const filter = onlyPublished ? { isPublished: true } : {};
    const experiences = await Experience.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: experiences });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/experiences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const exp = await Experience.create(pickAllowed(req.body, EXPERIENCE_FIELDS));
    res.status(201).json({ success: true, data: exp });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/experiences/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const exp = await Experience.findByIdAndUpdate(req.params.id, pickAllowed(req.body, EXPERIENCE_FIELDS), {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: exp });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/experiences/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Experience deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== TESTIMONIALS ====================
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const onlyPublished = req.query.all !== 'true';
    const filter = onlyPublished ? { isPublished: true } : {};
    const testimonials = await Testimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/testimonials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Testimonial.create(pickAllowed(req.body, TESTIMONIAL_FIELDS));
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/testimonials/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, pickAllowed(req.body, TESTIMONIAL_FIELDS), {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/testimonials/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== ANNOUNCEMENTS ====================
router.get('/announcements', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const announcements = await Announcement.find({
      isPublished: true,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/announcements/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/announcements', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Announcement.create(pickAllowed(req.body, ANNOUNCEMENT_FIELDS));
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/announcements/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, pickAllowed(req.body, ANNOUNCEMENT_FIELDS), {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/announcements/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== GALLERY ====================
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    const { category, all } = req.query;
    const filter: any = all === 'true' ? {} : { isPublished: true };
    if (category && category !== 'All') {
      filter.category = category;
    }
    const images = await GalleryImage.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/gallery', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await GalleryImage.create(pickAllowed(req.body, GALLERY_FIELDS));
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/gallery/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await GalleryImage.findByIdAndUpdate(req.params.id, pickAllowed(req.body, GALLERY_FIELDS), {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/gallery/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await GalleryImage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
