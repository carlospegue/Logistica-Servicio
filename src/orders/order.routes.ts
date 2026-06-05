import { Router } from 'express';
import { authMiddleware } from '../middlewares/AuthMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrderSchema, updateStatusSchema } from './orders.schemas';
import { createOrder, getOrder, updateStatus } from './order.controller';

const router = Router();
router.use(authMiddleware);
router.post('/', validateRequest(createOrderSchema), createOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', validateRequest(updateStatusSchema), updateStatus);
export default router;