import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const roleGuard = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Acceso denegado: permisos insuficientes', 403));
    }
    next();
  };
};