import { z } from 'zod';

export const communityQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
