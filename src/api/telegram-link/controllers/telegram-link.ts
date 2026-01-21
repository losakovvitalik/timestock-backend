import { factories } from '@strapi/strapi';
import { nanoid } from 'nanoid';
import Context from '../../../shared/utils/context';
import { sendResponse } from '../../../shared/lib/response';
import { env } from '../../../shared/config/env';
import { validatePayload } from '../../../shared/lib/validate-payload';
import { toggleNotificationsSchema } from '../schemas/toggle-notifications.schema';

export default factories.createCoreController('api::telegram-link.telegram-link', () => ({
  async generateLink(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();

    const token = nanoid(32);

    // Токен действителен 15 минут
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const oldTokens = await strapi.documents('api::telegram-token.telegram-token').findMany({
      filters: {
        user: { id: userId },
        used: false,
      },
    });

    for (const oldToken of oldTokens) {
      await strapi.documents('api::telegram-token.telegram-token').delete({
        documentId: oldToken.documentId,
      });
    }

    await strapi.documents('api::telegram-token.telegram-token').create({
      data: {
        token,
        user: userId,
        expires_at: expiresAt.toISOString(),
        used: false,
      },
    });

    const botLink = `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${token}`;

    return sendResponse({
      link: botLink,
      expiresIn: 900,
    });
  },

  async getStatus(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();

    const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        user: { id: userId },
      },
    });

    return sendResponse({
      isConnected: !!telegramLink,
      notificationsEnabled: telegramLink?.notifications_enabled ?? false,
    });
  },

  async unlink(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();

    const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        user: { id: userId },
      },
    });

    if (telegramLink) {
      await strapi.documents('api::telegram-link.telegram-link').delete({
        documentId: telegramLink.documentId,
      });
    }

    return sendResponse({ success: true });
  },

  async toggleNotifications(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();
    const rawBody = context.getBody();
    const { enabled } = validatePayload(toggleNotificationsSchema, rawBody);

    const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        user: { id: userId },
      },
    });

    if (!telegramLink) {
      return ctx.notFound('Telegram аккаунт не привязан');
    }

    await strapi.documents('api::telegram-link.telegram-link').update({
      documentId: telegramLink.documentId,
      data: {
        notifications_enabled: enabled,
      },
    });

    return sendResponse({ notificationsEnabled: enabled });
  },
}));
