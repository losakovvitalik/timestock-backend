import { z } from "zod";

export const confirmOTPSchema = z.object({
  email: z.string().nonempty().email(),
  code: z.string().nonempty().length(6),
});
