import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.services';

const svc = new OrderService();

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await svc.createOrder(req.user!.id, req.body.items);
        res.status(201).json({ status: 'success', data: order });
    } catch (e) { next(e); }
};

export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await svc.getOrderById(Number(req.params.id));
        res.json({ status: 'success', data: order });
    } catch (e) { next(e); }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await svc.updateStatus(Number(req.params.id), req.body.status);
        res.json({ status: 'success', data: order });
    } catch (e) { next(e); }
};