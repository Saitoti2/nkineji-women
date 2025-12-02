import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    otp: z.string().optional(),
  }).refine((data) => {
    // Must have either email+password OR phone+otp
    return (data.email && data.password) || (data.phone && data.otp);
  }, {
    message: 'Either email+password or phone+otp required',
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

export const otpSchema = z.object({
  body: z.object({
    phone: z.string().min(10),
    otp: z.string().length(6).optional(),
  }),
});

