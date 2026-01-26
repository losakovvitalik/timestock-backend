import type { CallbackQueryContext, Context } from 'grammy';
import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { TimerError } from '../../../../api/time-entry/services/time-entry.service.types';
import { formatDuration } from '../utils/format-timer';
import { CallbackAction, parseCallback } from '../utils/callback-data';
import { getUserByChatId } from '../utils/telegram-link';

export async function handleStopTimer(ctx: CallbackQueryContext<Context>) {
  const chatId = String(ctx.chat?.id);
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.STOP_TIMER) ?? [];

  if (!documentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: таймер не найден' });
    return;
  }

  const user = await getUserByChatId(chatId);

  if (!user) {
    await ctx.answerCallbackQuery({ text: 'Аккаунт не привязан' });
    return;
  }

  try {
    const result = await TimeEntryService.stopTimer(documentId, user.id);

    if (result.success === false) {
      const messages: Record<string, string> = {
        [TimerError.NOT_FOUND]: 'Таймер не найден',
        [TimerError.FORBIDDEN]: 'Нет доступа к этому таймеру',
        [TimerError.ALREADY_STOPPED]: 'Таймер уже остановлен',
      };
      const message = messages[result.reason];

      await ctx.answerCallbackQuery({ text: message });
      await ctx.editMessageText(`${message}.`);
      return;
    }

    const { startTime, endTime, entry } = result;

    const durationText = formatDuration(startTime, endTime);
    const projectName = entry.project?.name ?? 'Без проекта';

    await ctx.answerCallbackQuery({ text: 'Таймер остановлен' });
    await ctx.editMessageText(`✅ Таймер остановлен\n${projectName} - ${durationText}`);
  } catch (error) {
    strapi.log.error('Stop timer error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при остановке таймера' });
  }
}
