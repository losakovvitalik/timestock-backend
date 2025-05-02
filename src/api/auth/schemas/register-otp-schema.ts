import { z } from "zod";

export const sendOTPSchema = z.object({
  email: z.string().nonempty().email(),
});

export type SendOTPSchemaType = z.infer<typeof sendOTPSchema>;