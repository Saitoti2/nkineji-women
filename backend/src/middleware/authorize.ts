import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError('Insufficient permissions', 403);
    }

    next();
  };
};


