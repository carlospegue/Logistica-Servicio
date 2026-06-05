import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.services';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body.email, req.body.password, req.body.role);
    res.status(201).json({ status: 'success', data: user });
  } catch (e) { next(e); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ status: 'success', data: result });
  } catch (e) { next(e); }
};