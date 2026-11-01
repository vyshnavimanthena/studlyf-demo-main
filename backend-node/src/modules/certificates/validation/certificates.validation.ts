import { z } from 'zod';

export const certificatesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
