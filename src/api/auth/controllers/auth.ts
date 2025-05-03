import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import {
  sendError,
  sendNotFoundError,
  sendResponse,
  sendValidationError,
} from '../../../shared/utils/response';
import { sendOTPSchema } from '../schemas/register-otp-schema';
import { OTPService } from '../services/otp-service';
import { UserService } from '../services/user-service';
import { confirmOTPSchema } from '../schemas/confirm-otp-schema';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async sendOTP(ctx) {
    const context = new Context(ctx);

    const rawBody = context.getBody();
    const { data: body, error, success } = sendOTPSchema.safeParse(rawBody);
    if (!success) {
      return sendValidationError({
        details: error.format(),
      });
    }

    const user = await UserService.findByEmail(body.email);

    let otpCode: string;
    try {
      otpCode = await OTPService.sendEmail(body.email);
    } catch (error) {
      strapi.log.error(error);
      return sendError({
        code: 'FAILED_SEND_EMAIL',
        message: 'Failed to send the email',
      });
    }

    // если пользователь существует сразу отправляем ему код
    if (user) {
      await strapi.documents('plugin::users-permissions.user').update({
        documentId: user.documentId,
        data: {
          otp_code: otpCode,
        },
      });

      return sendResponse({
        status: 'ok',
      });
    }
    // если нет создает
    const authenticatedRole = await strapi.documents('plugin::users-permissions.role').findFirst({
      filters: {
        type: 'authenticated',
      },
    });

    await strapi.documents('plugin::users-permissions.user').create({
      data: {
        email: body.email,
        username: body.email,
        otp_code: otpCode,
        provider: 'local',
        role: authenticatedRole.id,
      },
    });

    return sendResponse({
      status: 'ok',
    });
  },
  async confirmOTP(ctx) {
    const context = new Context(ctx);

    const rawBody = context.getBody();
    const { data: body, error, success } = confirmOTPSchema.safeParse(rawBody);
    if (!success) {
      return sendValidationError({
        details: error.format(),
      });
    }

    const { code, email } = body;
    const user = await UserService.findByEmail(email);

    if (!user) {
      return sendNotFoundError({
        details: {
          email: email,
        },
      });
    }

    if (user.otp_code !== code) {
      return sendError({
        code: 'INCORRECT_CODE',
      });
    }

    const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
      id: user.id,
    });

    await strapi.documents('plugin::users-permissions.user').update({
      documentId: user.documentId,
      data: {
        otp_code: null,
        confirmed: true,
      },
    });

    return {
      jwt,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },
}));
