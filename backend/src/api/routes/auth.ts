import { Router } from 'express';
import { login, refresh, logout, forgotPassword, resetPassword, sendOTP, verifyOTP, register } from '../../services/authService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, otpSchema, registerSchema } from '../../types/schemas/authSchemas.js';

export const authRouter = Router();

// POST /api/v1/auth/login
authRouter.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password, phone, otp } = req.body;
    const result = await login({ email, password, phone, otp });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/google
authRouter.post('/google', async (req, res, next) => {
  try {
    const { idToken, access_token, googleId, email, name, avatar } = req.body;
    const { googleLogin } = await import('../../services/authService.js');

    if (access_token) {
      // New: verify access_token via Google userinfo endpoint
      const result = await googleLogin(undefined, access_token);
      return res.json(result);
    } else if (idToken) {
      // Legacy: verify idToken via Google tokeninfo endpoint
      const result = await googleLogin(idToken, undefined);
      return res.json(result);
    } else if (googleId && email) {
      // Fallback: trust provided user info (less secure — only for dev/testing)
      const result = await googleLogin(undefined, undefined, { googleId, email, name, avatar });
      return res.json(result);
    } else {
      throw new ApiError('access_token or idToken is required', 400);
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/register
authRouter.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/refresh
authRouter.post('/refresh', validateRequest(refreshTokenSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await refresh(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = (req as any).user?.id || req.body.userId;
    if (userId) {
      await logout(refreshToken || '', userId);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/forgot
authRouter.post('/forgot', validateRequest(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    await forgotPassword(email);
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/reset
authRouter.post('/reset', validateRequest(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/otp/send
authRouter.post('/otp/send', validateRequest(otpSchema), async (req, res, next) => {
  try {
    const { phone } = req.body;
    await sendOTP(phone);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/otp/verify
authRouter.post('/otp/verify', validateRequest(otpSchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const result = await verifyOTP(phone, otp);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Temporary debug route to run RBAC migration
authRouter.get('/debug/migrate-rbac', async (req, res, next) => {
  try {
    const { query } = await import('../../db/connection.js');
    const { readFileSync } = await import('fs');
    const { join, dirname } = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const sqlPath = join(__dirname, '../../../migrations/012_auth_rbac_enhancements.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    await query(sql);
    res.json({ success: true, message: 'RBAC migration applied successfully' });
  } catch (error: any) {
    console.error('RBAC Migration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
