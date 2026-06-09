import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ApiError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';
import { logger } from '../../utils/logger.js';

const router = Router();

import { storage } from '../../config/cloudinary.js';

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

router.post('/', authenticate, (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            logger.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                error: err.message
            });
        } else if (err) {
            logger.error('Upload error:', err);
            return next(err);
        }

        try {
            if (!req.file) {
                throw new ApiError('No file uploaded', 400);
            }

            const fileUrl = (req.file as any).path;

            res.status(200).json({
                success: true,
                data: {
                    url: fileUrl,
                    filename: req.file.filename,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                },
            });
        } catch (error) {
            next(error);
        }
    });
});

export { router as uploadRouter };
