
console.log('Backend index.ts loading...');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { logger } from './utils/logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getPool } from './db/connection.js';

// Route Imports
import { authRouter } from './api/routes/auth.js';
import { adminRouter } from './api/routes/admin.js';
import { beneficiariesRouter } from './api/routes/beneficiaries.js';
import { campaignsRouter } from './api/routes/campaigns.js';
import { donationsRouter } from './api/routes/donations.js';
import { itemsRouter } from './api/routes/items.js';
import { healthRouter } from './api/routes/health.js';
import { impactStoryRouter } from './api/routes/impactStories.js';
import { impactCommentRouter } from './api/routes/impactComments.js';
import { uploadRouter } from './api/routes/upload.js';
import { settingsRouter } from './api/routes/settings.js';
import { userRouter } from './api/routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Handle Vercel's proxy for express-rate-limit
if (process.env.VERCEL) {
    app.set('trust proxy', 1);
}

// Security & Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
}));
app.use(cors({
    origin: (origin, callback) => {
        const envOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [];
        const allowedOrigins = [
            ...envOrigins,
            'http://localhost:5173',
            'https://nkineji.org',
            'https://nkineji-initiative.vercel.app',
            'https://inua-mama-initiative.vercel.app',
            'https://mara-bloom.vercel.app',
            'https://nkinejiwomen.com',
            'https://www.nkinejiwomen.com'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Relaxed limit for development
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use(requestLogger);

// Database Connection Check (non-blocking for serverless)
if (process.env.VERCEL !== '1') {
    getPool().connect().then(client => {
        logger.info('Database connection established');
        client.release();
    }).catch(err => {
        logger.error('Database connection failed', err);
    });
}

// Routes
const API_PREFIX = '/api/v1';

// Root & Favicon routes to ensure 200 OK for search crawlers
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'favicon.ico'));
});
app.get('/favicon-48x48.png', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'favicon-48x48.png'));
});

app.get('/', (req, res) => {
    res.json({
        message: 'Nkineji Community Development API is running',
        version: '1.0.0',
        health: `${API_PREFIX}/health`
    });
});

// Public stats endpoint — no auth required
app.get(`${API_PREFIX}/public/stats`, async (req, res, next) => {
    try {
        const [
            beneficiariesResult,
            raisedResult,
            donorsResult,
            storiesResult,
            campaignsResult,
        ] = await Promise.all([
            getPool().query(`SELECT COUNT(*) as count FROM beneficiaries WHERE is_deleted = FALSE`),
            getPool().query(`SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'succeeded' AND is_deleted = FALSE`),
            getPool().query(`SELECT COUNT(DISTINCT email) as count FROM donations WHERE status = 'succeeded' AND is_deleted = FALSE`),
            getPool().query(`SELECT COUNT(*) as count FROM impact_stories WHERE status = 'published'`),
            getPool().query(`SELECT COUNT(*) as count FROM campaigns WHERE status = 'active' AND is_deleted = FALSE`),
        ]);

        res.json({
            success: true,
            data: {
                beneficiariesCount: parseInt(beneficiariesResult.rows[0]?.count || '0'),
                totalRaised: parseFloat(raisedResult.rows[0]?.total || '0'),
                uniqueDonors: parseInt(donorsResult.rows[0]?.count || '0'),
                storiesCount: parseInt(storiesResult.rows[0]?.count || '0'),
                activeCampaigns: parseInt(campaignsResult.rows[0]?.count || '0'),
            },
        });
    } catch (error) {
        next(error);
    }
});


// Public Stats Endpoint — no auth required, cached-friendly
app.get(`${API_PREFIX}/stats`, async (req, res, next) => {
    try {
        const [
            campaignsResult,
            beneficiariesResult,
            donationsResult,
            raisedResult,
            storiesResult,
            commentsResult,
        ] = await Promise.all([
            getPool().query(`SELECT COUNT(*) as count FROM campaigns WHERE is_deleted = FALSE AND status = 'active'`),
            getPool().query(`SELECT COUNT(*) as count FROM beneficiaries WHERE is_deleted = FALSE`),
            getPool().query(`SELECT COUNT(*) as count FROM donations WHERE is_deleted = FALSE AND status = 'succeeded'`),
            getPool().query(`SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE status = 'succeeded' AND is_deleted = FALSE`),
            getPool().query(`SELECT COUNT(*) as count FROM impact_stories WHERE status = 'published'`),
            getPool().query(`SELECT COUNT(*) as count FROM impact_comments WHERE status = 'approved'`),
        ]);

        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        res.json({
            success: true,
            data: {
                activeCampaigns: parseInt(campaignsResult.rows[0]?.count || '0'),
                beneficiaries: parseInt(beneficiariesResult.rows[0]?.count || '0'),
                donations: parseInt(donationsResult.rows[0]?.count || '0'),
                totalRaised: parseFloat(raisedResult.rows[0]?.total || '0'),
                impactStories: parseInt(storiesResult.rows[0]?.count || '0'),
                communityComments: parseInt(commentsResult.rows[0]?.count || '0'),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/beneficiaries`, beneficiariesRouter);
app.use(`${API_PREFIX}/campaigns`, campaignsRouter);
app.use(`${API_PREFIX}/donations`, donationsRouter);
app.use(`${API_PREFIX}/items`, itemsRouter);
app.use(`${API_PREFIX}/health`, healthRouter);
app.use(`${API_PREFIX}/impact-stories`, impactStoryRouter);
app.use(`${API_PREFIX}/impact-comments`, impactCommentRouter);
app.get(`${API_PREFIX}/debug-test`, async (req, res) => {
    try {
        const result = await getPool().query('SELECT * FROM campaign_items WHERE is_deleted = FALSE AND is_active = $1 ORDER BY created_at DESC', [true]);
        res.status(200).json({ status: 'alive', data: result.rows });
    } catch (e: any) {
        res.status(500).json({ status: 'error', message: e.message, stack: e.stack });
    }
});
console.log('Registering upload router at', `${API_PREFIX}/upload`);
app.use(`${API_PREFIX}/upload`, uploadRouter);
app.use(`${API_PREFIX}/settings`, settingsRouter);
app.use(`${API_PREFIX}/users`, userRouter);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found'
    });
});

// Error Handler
app.use(errorHandler);

// Start Server only if not running in Vercel (Vercel handles binding)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
}

export default app;
