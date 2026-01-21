import { Bot } from 'grammy';
import { env } from '../config/env';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command('start', async (ctx) => {
  const token = ctx.match;

  if (!token) {
    await ctx.reply('Для привязки аккаунта перейдите по ссылке из приложения Timestock.');
    return;
  }

  try {
    const tokenRecord = await strapi.documents('api::telegram-token.telegram-token').findFirst({
      filters: { token },
      populate: ['user'],
    });

    if (!tokenRecord) {
      await ctx.reply('Неверная ссылка для привязки. Пожалуйста, получите новую ссылку в приложении.');
      return;
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await ctx.reply('Ссылка для привязки истекла. Пожалуйста, получите новую ссылку в приложении.');
      return;
    }

    if (tokenRecord.used) {
      await ctx.reply('Эта ссылка уже была использована. Пожалуйста, получите новую ссылку в приложении.');
      return;
    }

    const userId = (tokenRecord.user as { id: number }).id;

    const existingLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        chat_id: String(ctx.chat.id),
      },
    });

    if (existingLink) {
      await ctx.reply('Этот Telegram аккаунт уже привязан к другому пользователю.');
      return;
    }

    const userLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        user: { id: userId },
      },
    });

    if (userLink) {
      await strapi.documents('api::telegram-link.telegram-link').update({
        documentId: userLink.documentId,
        data: {
          chat_id: String(ctx.chat.id),
        },
      });
    } else {
      await strapi.documents('api::telegram-link.telegram-link').create({
        data: {
          user: userId,
          chat_id: String(ctx.chat.id),
          notifications_enabled: true,
        },
      });
    }

    await strapi.documents('api::telegram-token.telegram-token').update({
      documentId: tokenRecord.documentId,
      data: { used: true },
    });

    await ctx.reply('Аккаунт успешно привязан! Теперь вы будете получать уведомления в Telegram.');
  } catch (error) {
    strapi.log.error('Telegram bot error:', error);
    await ctx.reply('Произошла ошибка при привязке аккаунта. Попробуйте позже.');
  }
});

export function startTelegramBot() {
  bot.start({
    onStart: (botInfo) => {
      strapi.log.info(`Telegram bot @${botInfo.username} started`);
    },
  });
}

export function stopTelegramBot() {
  bot.stop();
}

export { bot };
