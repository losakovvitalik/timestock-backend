import type { CallbackQueryContext, Context } from 'grammy';
import { ProjectService } from '../../../../api/project/services/project.service';
import { formatDuration } from '../utils/get-active-timer';
import { CallbackAction, parseCallback } from '../utils/callback-data';

export async function handleStopTimer(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.STOP_TIMER) ?? [];

  if (!documentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: таймер не найден' });
    return;
  }

  try {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project'],
    });

    if (!entry || entry.end_time) {
      await ctx.answerCallbackQuery({ text: 'Таймер уже остановлен' });
      await ctx.editMessageText('Таймер уже остановлен.');
      return;
    }

    const endTime = new Date();
    const startTime = new Date(entry.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data: {
        end_time: endTime.toISOString(),
        duration,
      },
    });

    if (entry.project?.documentId) {
      await ProjectService.recalculateTotalDuration(entry.project.documentId);
    }

    const durationText = formatDuration(startTime, endTime);
    const projectName = entry.project?.name ?? 'Без проекта';

    await ctx.answerCallbackQuery({ text: 'Таймер остановлен' });
    await ctx.editMessageText(`✅ Таймер остановлен\n${projectName} - ${durationText}`);
  } catch (error) {
    strapi.log.error('Stop timer error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при остановке таймера' });
  }
}
