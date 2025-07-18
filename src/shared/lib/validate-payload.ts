import { ZodObject, ZodRawShape, z } from 'zod';
import { sendValidationError } from './response';

export function validatePayload<T extends ZodRawShape>(
  schema: ZodObject<T>,
  data: unknown
): z.infer<typeof schema> {
  const { success, data: parsedData, error } = schema.safeParse(data);

  if (!success) {
    sendValidationError(error);
  }

  return parsedData;
}
