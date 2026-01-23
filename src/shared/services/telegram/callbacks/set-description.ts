import type { CallbackQueryContext, Context } from 'grammy';
import { formatDuration } from '../utils/get-active-timer';
import { timerKeyboard } from '../keyboards/timer';
import { CallbackAction, parseCallback } from '../utils/callback-data';

// Храним ожидание ввода описания для пользователей
export const pendingDescriptions = new Map<string, string>();

export async function handleSetDescription(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.SET_DESCRIPTION) ?? [];
  const chatId = String(ctx.chat?.id);

  if (!documentId || !chatId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
    return;
  }

  try {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project'],
    });

    if (!entry || entry.end_time) {
      await ctx.answerCallbackQuery({ text: 'Таймер уже остановлен' });
      return;
    }

    // Сохраняем documentId для ожидания ввода
    pendingDescriptions.set(chatId, documentId);

    await ctx.answerCallbackQuery();
    await ctx.reply('Введите описание для таймера:');
  } catch (error) {
    strapi.log.error('Set description error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
  }
}

export async function handleDescriptionText(ctx: Context) {
  const chatId = String(ctx.chat?.id);
  const text = ctx.message?.text;

  if (!chatId || !text) {
    return;
  }

  const documentId = pendingDescriptions.get(chatId);
  if (!documentId) {
    return;
  }

  pendingDescriptions.delete(chatId);

  try {
    const entry = await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data: { description: text },
      populate: ['project'],
    });

    if (!entry) {
      await ctx.reply('Таймер не найден.');
      return;
    }

    const duration = formatDuration(entry.start_time);
    const projectName = entry.project?.name ?? 'Без проекта';

    const keyboard = timerKeyboard(documentId, {
      hasDescription: true,
      hasProject: !!entry.project,
    });

    await ctx.reply(`✅ Описание добавлено\n\n⏰ ${projectName} - ${duration}\n${text}`, {
      reply_markup: keyboard,
    });
  } catch (error) {
    strapi.log.error('Save description error:', error);
    await ctx.reply('Ошибка при сохранении описания.');
  }
}
