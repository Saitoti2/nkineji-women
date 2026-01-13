
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
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
    max: 100 // limit each IP to 100 requests per windowMs
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

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/beneficiaries`, beneficiariesRouter);
app.use(`${API_PREFIX}/campaigns`, campaignsRouter);
app.use(`${API_PREFIX}/donations`, donationsRouter);
app.use(`${API_PREFIX}/items`, itemsRouter);
app.use(`${API_PREFIX}/health`, healthRouter);
app.use(`${API_PREFIX}/impact-stories`, impactStoryRouter);
app.use(`${API_PREFIX}/impact-comments`, impactCommentRouter);
app.get(`${API_PREFIX}/debug-test`, (req, res) => res.status(200).json({ status: 'alive' }));
console.log('Registering upload router at', `${API_PREFIX}/upload`);
app.use(`${API_PREFIX}/upload`, uploadRouter);
app.use(`${API_PREFIX}/settings`, settingsRouter);
// Assuming generic health check or module

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
