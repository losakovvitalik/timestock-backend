import { z } from "zod";

export const registerOTPSchema = z.object({
  email: z.string().email().nonempty(),
});
