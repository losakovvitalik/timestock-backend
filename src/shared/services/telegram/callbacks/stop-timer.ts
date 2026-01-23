import type { CallbackQueryContext, Context } from 'grammy';
import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { formatDuration } from '../utils/format-timer';
import { CallbackAction, parseCallback } from '../utils/callback-data';

export async function handleStopTimer(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.STOP_TIMER) ?? [];

  if (!documentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: таймер не найден' });
    return;
  }

  try {
    const result = await TimeEntryService.stopTimer(documentId);

    if (result.success === false) {
      const message = result.reason === 'not_found' ? 'Таймер не найден' : 'Таймер уже остановлен';

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
