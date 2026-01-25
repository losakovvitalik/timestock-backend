import type { CallbackQueryContext, Context } from 'grammy';
import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { formatTimerMessage } from '../utils/format-timer';
import { timerKeyboard } from '../keyboards/timer';
import { getUserByChatId } from '../utils/telegram-link';
import { CallbackAction, parseCallback } from '../utils/callback-data';

export async function handleStartTimerWithProject(ctx: CallbackQueryContext<Context>) {
  const chatId = String(ctx.chat?.id);

  if (!chatId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: чат не найден' });
    return;
  }

  const params = parseCallback(ctx.callbackQuery.data, CallbackAction.START_TIMER_WITH_PROJECT);

  if (!params) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: некорректные данные' });
    return;
  }

  const [projectDocumentId] = params;

  try {
    const user = await getUserByChatId(chatId);

    if (!user) {
      await ctx.answerCallbackQuery({ text: 'Аккаунт не привязан' });
      return;
    }

    const result = await TimeEntryService.startTimer(user.id, projectDocumentId);

    if (result.success === false) {
      await ctx.answerCallbackQuery({ text: 'Таймер уже запущен' });
      return;
    }

    const { entry } = result;
    const keyboard = timerKeyboard(entry.documentId, {
      hasProject: !!entry.project,
    });

    await ctx.answerCallbackQuery({ text: 'Таймер запущен' });
    await ctx.editMessageText(formatTimerMessage(entry), { reply_markup: keyboard });
  } catch (error) {
    strapi.log.error('Start timer with project error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при запуске таймера' });
  }
}
