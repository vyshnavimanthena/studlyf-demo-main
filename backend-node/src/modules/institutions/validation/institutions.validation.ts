import { z } from 'zod';

export const institutionsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
