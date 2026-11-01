import { z } from 'zod';

export const healthQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
