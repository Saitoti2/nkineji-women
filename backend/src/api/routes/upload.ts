import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/authenticate.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { logger } from '../../utils/logger.js';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate that Cloudinary credentials exist at startup
const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (!hasCloudinaryConfig) {
  logger.warn('Cloudinary credentials are missing — image uploads will fail.');
}

// Use memoryStorage so we can stream to Cloudinary manually
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

router.post('/', authenticate, (req, res, next) => {
  if (!hasCloudinaryConfig) {
    return res.status(503).json({
      success: false,
      error: 'Image upload service is not configured. Please contact an administrator.',
    });
  }

  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer error:', err);
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      logger.error('Upload filter error:', err);
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      if (!req.file) {
        throw new ApiError('No file uploaded', 400);
      }

      // Stream buffer to Cloudinary
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'mara-bloom',
            transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }],
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file!.buffer);
      });

      logger.info(`Image uploaded to Cloudinary: ${uploadResult.secure_url}`);

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          filename: uploadResult.original_filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      });
    } catch (error: any) {
      logger.error('Cloudinary upload error:', error);
      if (error instanceof ApiError) return next(error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload image. Please try again.',
      });
    }
  });
});

export { router as uploadRouter };
