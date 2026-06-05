import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';

const svc = new ProductService();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const products = await svc.findAll(categoryId);
    res.json({ status: 'success', data: products });
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await svc.create(req.body);
    res.status(201).json({ status: 'success', data: product });
  } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await svc.update(Number(req.params.id), req.body);
    res.json({ status: 'success', data: product });
  } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.delete(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};

export const getLowStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await svc.getLowStock();
    res.json({ status: 'success', data: products });
  } catch (e) { next(e); }
};