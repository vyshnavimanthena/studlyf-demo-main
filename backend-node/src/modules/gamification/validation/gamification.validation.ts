import { z } from 'zod';

export const gamificationQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
