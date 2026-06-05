import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    stock: z.number().int().min(0),
    minStock: z.number().int().min(0),
    price: z.number().positive(),
    categoryId: z.number().int().positive(),
  }),
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial(),
  params: z.object({ id: z.string() }),
});