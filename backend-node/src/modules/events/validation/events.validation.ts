import { z } from 'zod';

export const eventsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
