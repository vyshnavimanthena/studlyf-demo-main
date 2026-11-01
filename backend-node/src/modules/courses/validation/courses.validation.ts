import { z } from 'zod';

export const coursesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
