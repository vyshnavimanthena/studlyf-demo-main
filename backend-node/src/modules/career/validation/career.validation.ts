import { z } from 'zod';

export const careerQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
