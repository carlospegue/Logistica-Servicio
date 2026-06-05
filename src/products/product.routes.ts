import { Router } from 'express';
import { authMiddleware } from './../middlewares/AuthMiddleware';
import { roleGuard } from '../middlewares/roleGuard';
import { validateRequest } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema } from './products.schemas';
import { getAll, create, update, remove, getLowStock } from './product.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.post('/', roleGuard(['ADMIN']), validateRequest(createProductSchema), create);
router.put('/:id', roleGuard(['ADMIN']), validateRequest(updateProductSchema), update);
router.delete('/:id', roleGuard(['ADMIN']), remove);

export default router;

// Nota: /api/reports/low-stock se registra en app.ts por separado