import { z } from 'zod';

export const judgesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
