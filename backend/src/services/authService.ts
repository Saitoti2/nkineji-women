import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../middleware/authenticate.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

// TODO: Replace with actual database queries
// This is a placeholder implementation

interface LoginCredentials {
  email?: string;
  password?: string;
  phone?: string;
  otp?: string;
}

interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

import { query } from '../db/connection.js';

export const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
  if (credentials.email && credentials.password) {
    // Email/password login
    const userResult = await query<{
      id: string;
      email: string;
      password_hash: string;
      role_id: string;
      organisation_id?: string;
      is_active: boolean;
    }>(
      `SELECT u.id, u.email, u.password_hash, u.role_id, u.organisation_id, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.is_deleted = FALSE`,
      [credentials.email]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError('Invalid credentials', 401);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new ApiError('Account is inactive', 403);
    }

    if (!user.password_hash) {
      throw new ApiError('Password not set. Please use password reset.', 401);
    }

    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: (user as any).role_name,
      organisationId: user.organisation_id,
    };

    const tokens = generateTokens(authUser);
    
    // Store refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, await bcrypt.hash(tokens.refreshToken, 10)]
    );

    logger.info(`User logged in: ${user.email}`);
    return { user: authUser, ...tokens };
  }

  if (credentials.phone && credentials.otp) {
    // Phone/OTP login
    // TODO: Verify OTP from database
    const userResult = await query<{
      id: string;
      phone: string;
      role_id: string;
      organisation_id?: string;
      is_active: boolean;
    }>(
      `SELECT u.id, u.phone, u.role_id, u.organisation_id, u.is_active, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.phone = $1 AND u.is_deleted = FALSE`,
      [credentials.phone]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError('Invalid credentials', 401);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new ApiError('Account is inactive', 403);
    }

    // TODO: Verify OTP
    // const otpResult = await query('SELECT * FROM otp_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW()', [credentials.phone, credentials.otp]);
    // if (otpResult.rows.length === 0) {
    //   throw new ApiError('Invalid OTP', 401);
    // }

    const authUser: AuthUser = {
      id: user.id,
      email: `${user.phone}@phone.local`,
      role: (user as any).role_name,
      organisationId: user.organisation_id,
    };

    const tokens = generateTokens(authUser);
    logger.info(`User logged in via OTP: ${credentials.phone}`);
    return { user: authUser, ...tokens };
  }

  throw new ApiError('Invalid login credentials', 400);
};

export const refresh = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as AuthUser;
    
    // Verify refresh token in database (revocation check)
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const tokenResult = await query(
      `SELECT * FROM refresh_tokens 
       WHERE user_id = $1 AND token_hash = $2 
       AND expires_at > NOW() AND revoked_at IS NULL`,
      [decoded.id, tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      const apiError: ApiError = new Error('Invalid or revoked refresh token');
      apiError.statusCode = 401;
      throw apiError;
    }
    
    const accessToken = generateAccessToken(decoded);
    return { accessToken };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const apiError: ApiError = new Error('Invalid refresh token');
    apiError.statusCode = 401;
    throw apiError;
  }
};

export const logout = async (refreshToken: string, userId: string): Promise<void> => {
  try {
    // Revoke all refresh tokens for user
    await query(
      `UPDATE refresh_tokens 
       SET revoked_at = NOW()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    logger.info(`User ${userId} logged out`);
  } catch (error) {
    logger.error('Error during logout', error);
    // Don't throw - logout should always succeed
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  // TODO: Find user by email
  // TODO: Generate reset token
  // TODO: Send email with reset link
  logger.info(`Password reset requested for: ${email}`);
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  // TODO: Verify reset token
  // TODO: Hash new password
  // TODO: Update user password
  // TODO: Invalidate reset token
  logger.info('Password reset completed');
};

export const sendOTP = async (phone: string): Promise<void> => {
  // TODO: Generate OTP
  // TODO: Store OTP with expiration
  // TODO: Send SMS via Twilio
  logger.info(`OTP sent to: ${phone}`);
};

export const verifyOTP = async (phone: string, otp: string): Promise<LoginResult> => {
  // TODO: Verify OTP
  // TODO: Create or find user
  const user: AuthUser = {
    id: 'user-id-placeholder',
    email: `${phone}@phone.local`,
    role: 'field_officer',
  };

  const tokens = generateTokens(user);
  return { user, ...tokens };
};

function generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

function generateAccessToken(user: AuthUser): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, organisationId: user.organisationId },
    secret,
    { expiresIn }
  );
}

function generateRefreshToken(user: AuthUser): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn }
  );
}

