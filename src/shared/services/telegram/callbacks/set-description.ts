import type { CallbackQueryContext } from 'grammy';
import type { BotContext } from '../types';
import { CallbackAction, parseCallback } from '../utils/callback-data';

export async function handleSetDescription(ctx: CallbackQueryContext<BotContext>) {
  const data = ctx.callbackQuery.data;
  const [documentId] = parseCallback(data, CallbackAction.SET_DESCRIPTION) ?? [];

  if (!documentId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка' });
    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('setDescriptionConversation', documentId);
}
