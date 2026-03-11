import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name?: string;
  avatar?: string;
  organisationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('AUTHENTICATION ERROR:', {
      message: error.message,
      stack: error.stack,
      token: req.headers.authorization?.substring(0, 20) + '...'
    });
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError('Invalid token', 401));
    }
    next(error);
  }
};

export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) return next();

    try {
      const decoded = jwt.verify(token, secret) as AuthUser;
      req.user = decoded;
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
    next();
  } catch (error) {
    next();
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new ApiError('Authentication required', 401));
  }

  const adminRoles = ['super_admin', 'chief_admin', 'admin'];
  if (!adminRoles.includes(req.user.role)) {
    return next(new ApiError('Admin access required', 403));
  }

  next();
};

/**
 * Granular Permission Middleware
 * @param requiredPermission e.g. 'items:edit'
 */
export const requirePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }

    const { permissions, role } = req.user;

    // Super Admin always has access
    if (role === 'super_admin' || permissions.includes('*')) {
      return next();
    }

    // Direct match
    if (permissions.includes(requiredPermission)) {
      return next();
    }

    // Wildcard match (e.g. 'items:*' matches 'items:edit')
    const [resource, action] = requiredPermission.split(':');
    if (permissions.includes(`${resource}:*`)) {
      return next();
    }

    // Watcher match (e.g. '*:view' matches 'items:view')
    if (action === 'view' && permissions.includes('*:view')) {
      return next();
    }

    return next(new ApiError(`Missing permission: ${requiredPermission}`, 403));
  };
};
