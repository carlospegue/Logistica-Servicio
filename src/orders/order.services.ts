import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import { OrderStatus } from '@prisma/client';

interface OrderItem { productId: number; quantity: number; }

export class OrderService {
    async createOrder(operatorId: string, items: OrderItem[]) {
        return prisma.$transaction(async (tx) => {
            // 1. Verificar stock para TODOS los productos
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new AppError(`Producto ID ${item.productId} no encontrado`, 404);
                if (product.stock < item.quantity) {
                    throw new AppError(
                        `Stock insuficiente para "${product.name}": disponible ${product.stock}, solicitado ${item.quantity}`,
                        400
                    );
                }
            }

            // 2. Descontar stock y recopilar precios históricos
            const orderItemsData = [];
            for (const item of items) {
                const product = await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtOrder: product.price,
                });
            }

            // 3. Crear el pedido con sus items
            const order = await tx.order.create({
                data: {
                    operatorId,
                    items: { create: orderItemsData },
                },
                include: { items: { include: { product: true } }, operator: { select: { email: true } } },
            });

            return order;
        });
    }

    async getOrderById(id: number) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: { include: { category: true } } } }, operator: { select: { email: true, role: true } } },
        });
        if (!order) throw new AppError('Pedido no encontrado', 404);
        return order;
    }

    async updateStatus(id: number, status: OrderStatus) {
        const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
        if (!order) throw new AppError('Pedido no encontrado', 404);
        if (order.status !== 'PENDING') throw new AppError('Solo se pueden modificar pedidos en estado PENDING', 400);

        return prisma.$transaction(async (tx) => {
            // Si se cancela, reintegrar stock
            if (status === 'CANCELLED') {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }
            }
            return tx.order.update({
                where: { id },
                data: { status },
                include: { items: true },
            });
        });
    }
}