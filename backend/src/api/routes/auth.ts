import { Router } from 'express';
import { login, refresh, logout, forgotPassword, resetPassword, sendOTP, verifyOTP } from '../../services/authService.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, otpSchema } from '../../types/schemas/authSchemas.js';

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
    const userId = req.user?.id || req.body.userId;
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

