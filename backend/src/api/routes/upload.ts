import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ApiError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new ApiError('Only images (jpeg, jpg, png, webp, gif) are allowed', 400));
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter,
});

router.post('/', authenticate, upload.single('image'), (req, res) => {
    if (!req.file) {
        throw new ApiError('No file uploaded', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;

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
