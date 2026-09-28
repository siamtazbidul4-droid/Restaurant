import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../middleware/upload.middleware.js';
import { uploadMediaBuffer, deleteMediaAsset } from '../config/cloudinary.js';
import { Media } from '../models/Media.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { AuditLog } from '../models/AuditLog.js';

const router = Router();

// POST /api/media/upload
router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided for upload.' });
      }

      // Check max file size (8MB)
      if (req.file.size > 8 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'File size exceeds 8MB limit.' });
      }

      const altText = (req.body.altText as string) || req.file.originalname;
      const caption = (req.body.caption as string) || '';

      const uploadResult = await uploadMediaBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'aurelia_restaurant'
      );

      const mediaDoc = await Media.create({
        publicId: uploadResult.publicId,
        secureUrl: uploadResult.secureUrl,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resourceType: uploadResult.resourceType,
        folder: uploadResult.folder,
        altText,
        caption,
        bytes: uploadResult.bytes || req.file.size,
      });

      await AuditLog.create({
        actor: req.user?.email || 'Admin',
        action: 'MEDIA_UPLOADED',
        resource: 'Media',
        resourceId: mediaDoc._id.toString(),
        metadata: { url: uploadResult.secureUrl, publicId: uploadResult.publicId },
      });

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully.',
        data: {
          id: mediaDoc._id,
          url: uploadResult.secureUrl,
          publicId: uploadResult.publicId,
          altText: mediaDoc.altText,
          format: mediaDoc.format,
        },
      });
    } catch (err: any) {
      console.error('[Upload Error]', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to upload media asset.',
      });
    }
  },
  // Multer's fileFilter / fileSize rejections surface here (not in the async
  // handler above), so they must be translated into clean client errors.
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (!err) return next();
    const isUploadRejection =
      err.code === 'LIMIT_FILE_SIZE' ||
      err instanceof multer.MulterError ||
      /Unsupported file format/i.test(err.message || '');
    if (isUploadRejection) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds 8MB limit.'
        : err.message || 'Invalid file upload.';
      return res.status(400).json({ success: false, message, code: 'INVALID_UPLOAD' });
    }
    next(err);
  }
);

// GET /api/media
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const items = await Media.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/media/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Media.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Media item not found' });

    // Destroy asset on Cloudinary / local storage
    await deleteMediaAsset(item.publicId);

    await AuditLog.create({
      actor: req.user?.email || 'Admin',
      action: 'MEDIA_DELETED',
      resource: 'Media',
      resourceId: req.params.id,
      metadata: { publicId: item.publicId },
    });

    res.json({ success: true, message: 'Media removed from catalog and storage.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
