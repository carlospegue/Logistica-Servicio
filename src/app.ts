import express from 'express';
import authRoutes from './modules/auth.routes';
import productRoutes from './products/product.routes';
import orderRoutes from './orders/order.routes';
import { authMiddleware } from './middlewares/AuthMiddleware';
import { roleGuard } from './middlewares/roleGuard';
import { getLowStock } from './products/product.controller';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(express.json());

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Ruta de reporte (ADMIN)
app.get('/api/reports/low-stock', authMiddleware, roleGuard(['ADMIN']), getLowStock);

// Manejo global de errores (siempre al final)
app.use(errorHandler);

export default app;