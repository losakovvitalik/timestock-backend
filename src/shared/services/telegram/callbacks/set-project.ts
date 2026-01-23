import type { CallbackQueryContext, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { formatTimerMessage } from '../utils/get-active-timer';
import { timerKeyboard } from '../keyboards/timer';
import { CallbackAction, parseCallback, createCallback } from '../utils/callback-data';

export async function handleSetProject(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.SET_PROJECT) ?? [];
  const chatId = String(ctx.chat?.id);

  if (!documentId || !chatId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
    return;
  }

  try {
    // Получаем пользователя по chatId
    const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: { chat_id: chatId },
      populate: ['user'],
    });

    if (!telegramLink?.user) {
      await ctx.answerCallbackQuery({ text: 'Аккаунт не привязан' });
      return;
    }

    const userId = telegramLink.user.id;

    // Получаем проекты пользователя
    const projects = await strapi.documents('api::project.project').findMany({
      filters: {
        $or: [{ owner: { id: userId } }, { members: { id: userId } }],
      },
      limit: 10,
    });

    if (projects.length === 0) {
      await ctx.answerCallbackQuery({ text: 'У вас нет проектов' });
      return;
    }

    const keyboard = new InlineKeyboard();

    for (const project of projects) {
      keyboard.text(project.name, createCallback(CallbackAction.SELECT_PROJECT, documentId, project.documentId)).row();
    }

    keyboard.text('❌ Отмена', createCallback(CallbackAction.CANCEL_PROJECT, documentId));

    await ctx.answerCallbackQuery();
    await ctx.editMessageText('Выберите проект:', { reply_markup: keyboard });
  } catch (error) {
    strapi.log.error('Set project error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
  }
}

export async function handleSelectProject(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [entryDocumentId, projectDocumentId] = parseCallback(data, CallbackAction.SELECT_PROJECT) ?? [];

  if (!entryDocumentId || !projectDocumentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
    return;
  }

  try {
    const entry = await strapi.documents('api::time-entry.time-entry').update({
      documentId: entryDocumentId,
      data: { project: projectDocumentId },
      populate: ['project'],
    });

    if (!entry || !entry.start_time) {
      await ctx.answerCallbackQuery({ text: 'Таймер не найден' });
      return;
    }

    const keyboard = timerKeyboard(entryDocumentId, {
      hasDescription: !!entry.description,
      hasProject: true,
    });

    await ctx.answerCallbackQuery({ text: 'Проект выбран' });
    await ctx.editMessageText(formatTimerMessage(entry), {
      reply_markup: keyboard,
    });
  } catch (error) {
    strapi.log.error('Select project error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
  }
}

export async function handleCancelProject(ctx: CallbackQueryContext<Context>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.CANCEL_PROJECT) ?? [];

  if (!documentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
    return;
  }

  try {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project'],
    });

    if (!entry || !entry.start_time) {
      await ctx.answerCallbackQuery({ text: 'Таймер не найден' });
      return;
    }

    const keyboard = timerKeyboard(documentId, {
      hasDescription: !!entry.description,
      hasProject: !!entry.project,
    });

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(formatTimerMessage(entry), {
      reply_markup: keyboard,
    });
  } catch (error) {
    strapi.log.error('Cancel project error:', error);
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
  }
}
