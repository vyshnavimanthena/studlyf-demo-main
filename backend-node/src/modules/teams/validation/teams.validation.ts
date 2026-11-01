import { z } from 'zod';

export const teamsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
