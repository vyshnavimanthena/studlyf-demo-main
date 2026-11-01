import { z } from 'zod';

export const notificationsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
