import { z } from 'zod';

export const leaderboardQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
