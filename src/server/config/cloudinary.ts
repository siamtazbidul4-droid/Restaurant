import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

export function configureCloudinary(customConfig?: { cloudName?: string; apiKey?: string; apiSecret?: string }) {
  const cloudName = customConfig?.cloudName || process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = customConfig?.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = customConfig?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  const isConfigured = Boolean(cloudName && apiKey && apiSecret);

  if (isConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  return { isConfigured, cloudName };
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  resourceType: string;
  folder?: string;
  bytes?: number;
}

export async function uploadMediaBuffer(
  buffer: Buffer,
  filename: string,
  mimetype: string,
  folder = 'aurelia_restaurant'
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    configureCloudinary();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned empty result'));
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height,
            resourceType: result.resource_type,
            folder: result.folder,
            bytes: result.bytes,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Fallback when Cloudinary credentials have not been configured by owner yet:
  // Store reliably in public upload storage so uploaded media displays immediately!
  const uploadDir = path.resolve(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(filename) || (mimetype.includes('png') ? '.png' : mimetype.includes('webp') ? '.webp' : '.jpg');
  const safeBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueName = `${Date.now()}_${safeBase}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);

  await fs.promises.writeFile(filePath, buffer);

  return {
    publicId: `local_${uniqueName}`,
    secureUrl: `/uploads/${uniqueName}`,
    format: ext.replace('.', ''),
    resourceType: 'image',
    folder: 'local_uploads',
    bytes: buffer.length,
  };
}

export async function deleteMediaAsset(publicId: string): Promise<void> {
  if (!publicId) return;

  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const safePath = path.resolve(process.cwd(), 'public/uploads', path.basename(filename));
    try {
      if (fs.existsSync(safePath)) {
        await fs.promises.unlink(safePath);
      }
    } catch (err: any) {
      console.warn('[MediaStorage] Failed to unlink local file:', err.message);
    }
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    configureCloudinary();
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`[Cloudinary] Asset ${publicId} destroyed successfully.`);
    } catch (err: any) {
      console.warn(`[Cloudinary] Failed to destroy asset ${publicId}:`, err.message);
    }
  }
}
