import type { BotContext } from '../types';
import { getActiveTimer } from '../utils/get-active-timer';
import { formatTimerMessage } from '../utils/format-timer';
import { timerKeyboard, startTimerKeyboard } from '../keyboards/timer';
import { getUserByChatId } from '../utils/telegram-link';

export async function handleTimerButton(ctx: BotContext) {
  const chatId = String(ctx.chat?.id);

  if (!chatId) {
    return;
  }

  const user = await getUserByChatId(chatId);

  if (!user) {
    await ctx.reply('Для использования бота привяжите аккаунт через приложение Timestock.');
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
