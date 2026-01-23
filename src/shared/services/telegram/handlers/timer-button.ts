import type { Context } from 'grammy';
import { getActiveTimer, formatTimerMessage } from '../utils/get-active-timer';
import { timerKeyboard, startTimerKeyboard } from '../keyboards/timer';

export async function handleTimerButton(ctx: Context) {
  const chatId = String(ctx.chat?.id);

  if (!chatId) {
    return;
  }

  const activeTimer = await getActiveTimer(chatId);

  if (!activeTimer) {
    await ctx.reply('Нет активного таймера.', { reply_markup: startTimerKeyboard() });
    return;
  }

  const keyboard = timerKeyboard(activeTimer.documentId, {
    hasDescription: !!activeTimer.description,
    hasProject: !!activeTimer.project,
  });

  await ctx.reply(formatTimerMessage(activeTimer), {
    reply_markup: keyboard,
  });
}
