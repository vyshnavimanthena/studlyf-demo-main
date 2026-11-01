import { z } from 'zod';

export const adminQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
