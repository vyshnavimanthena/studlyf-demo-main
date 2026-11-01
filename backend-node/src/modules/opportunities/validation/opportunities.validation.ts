import { z } from 'zod';

export const opportunitiesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
