import { ZodObject, ZodRawShape, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const validateRequest = (schema: ZodObject<ZodRawShape>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({ body: req.body, params: req.params, query: req.query });
            next();
        } catch (e) {
            if (e instanceof ZodError) {
                const message = e.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', ');
                return next(new AppError(`Validación fallida: ${message}`, 400));
            }
            next(e);
        }
    };
};