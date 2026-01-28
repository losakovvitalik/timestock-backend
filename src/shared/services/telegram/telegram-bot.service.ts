import { Bot, session } from 'grammy';
import { conversations, createConversation } from '@grammyjs/conversations';
import { env } from '../../config/env';
import { startCommand } from './commands/start';
import { handleTimerButton } from './handlers/timer-button';
import { handleStopTimer } from './callbacks/stop-timer';
import { handleStartTimer } from './callbacks/start-timer';
import { handleStartTimerWithProject } from './callbacks/start-timer-with-project';
import { handleSetDescription } from './callbacks/set-description';
import { handleSetProject, handleSelectProject, handleCancelProject } from './callbacks/set-project';
import { handleSnoozeReminder } from './callbacks/snooze-reminder';
import { CallbackAction, callbackRegex } from './utils/callback-data';
import { setDescriptionConversation } from './conversations/set-description';
import type { BotContext } from './types';

const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(setDescriptionConversation));

bot.command('start', startCommand);
bot.hears('⏰ Таймер', handleTimerButton);
bot.callbackQuery(callbackRegex(CallbackAction.STOP_TIMER), handleStopTimer);
bot.callbackQuery(CallbackAction.START_TIMER, handleStartTimer);
bot.callbackQuery(callbackRegex(CallbackAction.START_TIMER_WITH_PROJECT), handleStartTimerWithProject);
bot.callbackQuery(callbackRegex(CallbackAction.SET_DESCRIPTION), handleSetDescription);
bot.callbackQuery(callbackRegex(CallbackAction.SET_PROJECT), handleSetProject);
bot.callbackQuery(callbackRegex(CallbackAction.SELECT_PROJECT), handleSelectProject);
bot.callbackQuery(callbackRegex(CallbackAction.CANCEL_PROJECT), handleCancelProject);
bot.callbackQuery(callbackRegex(CallbackAction.SNOOZE_REMINDER), handleSnoozeReminder);

bot.catch((err) => {
  console.error('Telegram bot error:', err);
});

export function startTelegramBot() {
  bot.start({
    onStart: (botInfo) => {
      console.log(`Telegram bot @${botInfo.username} started`);
    },
  });
}

export function stopTelegramBot() {
  bot.stop();
}

export { bot };
