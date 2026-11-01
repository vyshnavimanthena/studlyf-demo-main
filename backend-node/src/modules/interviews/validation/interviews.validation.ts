import { z } from 'zod';

export const interviewsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
