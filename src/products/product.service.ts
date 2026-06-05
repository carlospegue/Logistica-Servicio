import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';

export class ProductService {
    async findAll(categoryId?: number) {
        return prisma.product.findMany({
            where: categoryId ? { categoryId } : undefined,
            include: { category: true },
        });
    }

    async create(data: { name: string; sku: string; stock: number; minStock: number; price: number; categoryId: number }) {
        const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
        if (skuExists) throw new AppError('El SKU ya existe', 409);
        return prisma.product.create({ data, include: { category: true } });
    }

    async update(id: number, data: Partial<{ name: string; sku: string; stock: number; minStock: number; price: number; categoryId: number }>) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new AppError('Producto no encontrado', 404);
        return prisma.product.update({ where: { id }, data, include: { category: true } });
    }

    async delete(id: number) {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new AppError('Producto no encontrado', 404);
        await prisma.product.delete({ where: { id } });
    }

    async getLowStock() {
        const products = await prisma.product.findMany({
            include: { category: true },
        });
        return products.filter(p => p.stock <= p.minStock);
    }
}