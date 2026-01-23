import type { CallbackQueryContext, Context } from 'grammy';
import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { formatTimerMessage } from '../utils/format-timer';
import { timerKeyboard } from '../keyboards/timer';
import { getUserByChatId } from '../utils/telegram-link';

export async function handleStartTimer(ctx: CallbackQueryContext<Context>) {
  const chatId = String(ctx.chat?.id);

  if (!chatId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: чат не найден' });
    return;
  }

  try {
    const user = await getUserByChatId(chatId);

    if (!user) {
      await ctx.answerCallbackQuery({ text: 'Аккаунт не привязан' });
      return;
    }

    const result = await TimeEntryService.startTimer(user.id);

    if (result.success === false) {
      await ctx.answerCallbackQuery({ text: 'Таймер уже запущен' });
      return;
    }

    const { entry } = result;
    const keyboard = timerKeyboard(entry.documentId);

    await ctx.answerCallbackQuery({ text: 'Таймер запущен' });
    await ctx.editMessageText(formatTimerMessage(entry), { reply_markup: keyboard });
  } catch (error) {
    strapi.log.error('Start timer error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при запуске таймера' });
  }
}
