import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authRouter } from './api/routes/auth.js';
import { campaignsRouter } from './api/routes/campaigns.js';
import { donationsRouter } from './api/routes/donations.js';
import { beneficiariesRouter } from './api/routes/beneficiaries.js';
import { healthRouter } from './api/routes/health.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check (before auth)
app.use('/health', healthRouter);

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/campaigns`, campaignsRouter);
app.use(`/api/${API_VERSION}/donations`, donationsRouter);
app.use(`/api/${API_VERSION}/beneficiaries`, beneficiariesRouter);

// Error handling (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api/${API_VERSION}`);
  logger.info(`🏥 Health check at http://localhost:${PORT}/health`);
});

export default app;

