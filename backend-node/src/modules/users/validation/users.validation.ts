import { z } from 'zod';

export const usersQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
