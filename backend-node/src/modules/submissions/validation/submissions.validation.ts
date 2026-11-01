import { z } from 'zod';

export const submissionsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
