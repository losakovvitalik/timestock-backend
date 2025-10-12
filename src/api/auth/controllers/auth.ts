import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import {
  sendError,
  sendNotFoundError,
  sendResponse,
  sendValidationError,
} from '../../../shared/lib/response';
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

    /**
     * взял код для получения access и refresh токена из исходного кода strapi
     * https://github.com/strapi/strapi/blob/35ca30daa48c41dc5d8fa1d8312557d733c580da/packages/core/core/src/services/session-manager.ts
     * */
    const extractDeviceId = (requestBody) => {
      const { deviceId } = requestBody || {};

      return typeof deviceId === 'string' && deviceId.length > 0 ? deviceId : undefined;
    };

    const sanitizeUser = (user, ctx) => {
      const { auth } = ctx.state;
      const userSchema = strapi.getModel('plugin::users-permissions.user');

      return strapi.contentAPI.sanitize.output(user, userSchema, { auth });
    };

    const deviceId = extractDeviceId(ctx.request.body);

    const refresh = await strapi
      .sessionManager('users-permissions')
      .generateRefreshToken(String(user.id), deviceId, { type: 'refresh' });

    const access = await strapi
      .sessionManager('users-permissions')
      .generateAccessToken(refresh.token);
    if ('error' in access) {
      return sendError({
        code: 'INVALID_CREDENTIALS',
        statusCode: 403,
        message: 'Unauthorized access',
      });
    }

    const upSessions = strapi.config.get('plugin::users-permissions.sessions') as any;
    const requestHttpOnly = ctx.request.header['x-strapi-refresh-cookie'] === 'httpOnly';

    await strapi.documents('plugin::users-permissions.user').update({
      documentId: user.documentId,
      data: {
        otp_code: null,
        confirmed: true,
      },
    });

    if (upSessions?.httpOnly || requestHttpOnly) {
      const cookieName = upSessions.cookie?.name || 'strapi_up_refresh';
      const cookieOptions = {
        httpOnly: true,
        secure: Boolean(upSessions.cookie?.secure),
        sameSite: upSessions.cookie?.sameSite ?? 'lax',
        path: upSessions.cookie?.path ?? '/',
        domain: upSessions.cookie?.domain,
        overwrite: true,
        maxAge: 90 * 24 * 60 * 60 * 1000,
      };

      ctx.cookies.set(cookieName, refresh.token, cookieOptions);

      return ctx.send({ jwt: access.token, user: await sanitizeUser(user, ctx) });
    }

    return ctx.send({
      jwt: access.token,
      refreshToken: refresh.token,
      user: await sanitizeUser(user, ctx),
    });
  },
}));
