import { Request, Response, NextFunction } from 'express';

class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err.statusCode === 'number') {
    return res.status(err.statusCode).json({ status: 'error', message: err.message });
  }
  console.error('ERROR NO CONTROLADO:', err);
  res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
};