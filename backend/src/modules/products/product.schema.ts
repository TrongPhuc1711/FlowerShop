import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.number().int().positive().optional().nullable(),
  unitId: z.number().int().positive(),
  sku: z.string().min(1).max(60),
  name: z.string().min(1).max(200),
  type: z
    .enum(['HOA_SAP', 'HOA_LUA', 'HOA_GIA', 'BO_HOA', 'GIO_HOA', 'PHU_KIEN', 'KHAC'])
    .default('HOA_SAP'),
  price: z.number().min(0).default(0),
  refCostPrice: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  trackLot: z.boolean().default(true),
  shelfLifeDays: z.number().int().positive().optional().nullable(),
  imageUrl: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.string().optional(),
  isActive: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
