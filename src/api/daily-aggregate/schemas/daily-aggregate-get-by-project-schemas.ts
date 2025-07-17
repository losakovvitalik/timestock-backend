import { z } from 'zod';

export const dailyAggregateGetByProjectSchemas = z.object({
  projectId: z.string(),
  from: z.string(),
  to: z.string(),
});
