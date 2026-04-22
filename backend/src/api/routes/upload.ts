import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ApiError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';

const router = Router();

import { storage } from '../../config/cloudinary.js';

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

router.post('/', authenticate, upload.single('image'), (req, res) => {
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
});

export { router as uploadRouter };
