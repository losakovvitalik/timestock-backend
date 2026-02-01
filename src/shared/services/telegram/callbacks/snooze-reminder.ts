import type { CallbackQueryContext, Context } from 'grammy';
import { DateTime } from 'luxon';
import { CallbackAction, parseCallback } from '../utils/callback-data';

export async function handleSnoozeReminder(ctx: CallbackQueryContext<Context>) {
  const params = parseCallback(ctx.callbackQuery.data, CallbackAction.SNOOZE_REMINDER);

  if (!params) {
    await ctx.answerCallbackQuery({ text: 'Ошибка: некорректные данные' });
    return;
  }

  const [reminderDocumentId, minutesStr] = params;
  const minutes = parseInt(minutesStr, 10);

  try {
    const reminder = await strapi.documents('api::project-reminder.project-reminder').findOne({
      documentId: reminderDocumentId,
      populate: ['user'],
    });

    if (!reminder) {
      await ctx.answerCallbackQuery({ text: 'Напоминание не найдено' });
      return;
    }

    const snoozedUntil = DateTime.now().plus({ minutes }).toJSDate();

    await strapi.documents('api::project-reminder.project-reminder').update({
      documentId: reminderDocumentId,
      data: {
        snoozed_until: snoozedUntil,
      },
    });

    const userTimezone = reminder.user?.timezone || 'UTC';
    const scheduledTime = DateTime.fromJSDate(snoozedUntil).setZone(userTimezone).toFormat('HH:mm');

    await ctx.answerCallbackQuery({ text: `Отложено на ${minutes} мин` });
    await ctx.editMessageText(`✅ Напоминание отложено на ${minutes} минут\nУведомление будет отправлено в ${scheduledTime}`);
  } catch (error) {
    strapi.log.error('Snooze reminder error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка при откладывании' });
  }
}
