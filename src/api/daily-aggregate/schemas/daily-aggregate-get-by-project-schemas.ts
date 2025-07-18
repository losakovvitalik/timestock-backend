import { z } from 'zod';

export const dailyAggregateGetByProjectQuerySchema = z.object({
  projectId: z.string(),
  from: z.string(),
  to: z.string(),
});
