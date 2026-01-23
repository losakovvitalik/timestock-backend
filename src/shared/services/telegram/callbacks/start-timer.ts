import type { CallbackQueryContext, Context } from 'grammy';
import { formatTimerMessage } from '../utils/get-active-timer';
import { timerKeyboard } from '../keyboards/timer';

export async function handleStartTimer(ctx: CallbackQueryContext<Context>) {
  const chatId = String(ctx.chat?.id);

  if (!chatId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: чат не найден' });
    return;
  }

  try {
    const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: { chat_id: chatId },
      populate: ['user'],
    });

    if (!telegramLink?.user) {
      await ctx.answerCallbackQuery({ text: 'Аккаунт не привязан' });
      return;
    }

    const userId = telegramLink.user.id;

    // Проверяем, нет ли уже активного таймера
    const activeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
      filters: {
        user: { id: userId },
        end_time: { $null: true },
      },
    });

    if (activeEntry) {
      await ctx.answerCallbackQuery({ text: 'Таймер уже запущен' });
      return;
    }

    // Создаём новый таймер без проекта
    const newEntry = await strapi.documents('api::time-entry.time-entry').create({
      data: {
        start_time: new Date().toISOString(),
        user: userId,
      },
    });

    const keyboard = timerKeyboard(newEntry.documentId);

    await ctx.answerCallbackQuery({ text: 'Таймер запущен' });
    await ctx.editMessageText(formatTimerMessage(newEntry), { reply_markup: keyboard });
  } catch (error) {
    strapi.log.error('Start timer error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при запуске таймера' });
  }
}
