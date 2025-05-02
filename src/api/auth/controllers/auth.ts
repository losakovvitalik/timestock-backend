/**
 * project controller
 */

import { factories } from "@strapi/strapi";
import { registerOTPSchema } from "../schemas/register-otp-schema";
import Context from "../../../shared/utils/context";

export default factories.createCoreController(
  "plugin::users-permissions.user",
  ({ strapi }) => ({
    async registerOTP(ctx) {
      const context = new Context(ctx);
      const rawBody = context.getBody();

      console.log(rawBody);
      const body = registerOTPSchema.parse(rawBody);

      const isAlreadyExist = await strapi
        .documents("plugin::users-permissions.user")
        .findFirst({
          filters: {
            email: body.email,
          },
        });

      if (isAlreadyExist) {
        return ctx.badRequest("user already exists", {
          code: "USER_ALREADY_EXISTS",
        });
      }

      await strapi.documents("plugin::users-permissions.user").create({
        data: {
          email: body.email,
          username: body.email,
        },
      });

      return {
        status: "ok",
      };
    },
  })
);
