import { z } from 'zod';

export const sdlQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
