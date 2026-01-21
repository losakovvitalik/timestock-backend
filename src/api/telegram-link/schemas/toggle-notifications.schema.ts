import { z } from 'zod';

export const toggleNotificationsSchema = z.object({
  enabled: z.boolean(),
});
