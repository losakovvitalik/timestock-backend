import { z } from 'zod';

export const dailyTotalsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
