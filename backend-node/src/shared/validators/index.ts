import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId string format');

export const paginationQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});
