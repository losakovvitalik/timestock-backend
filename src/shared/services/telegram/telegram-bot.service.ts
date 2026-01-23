import { Bot } from 'grammy';
import { env } from '../../config/env';
import { startCommand } from './commands/start';
import { handleTimerButton } from './handlers/timer-button';
import { handleStopTimer } from './callbacks/stop-timer';
import { handleStartTimer } from './callbacks/start-timer';
import { handleSetDescription, handleDescriptionText, pendingDescriptions } from './callbacks/set-description';
import { handleSetProject, handleSelectProject, handleCancelProject } from './callbacks/set-project';
import { CallbackAction, callbackRegex } from './utils/callback-data';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command('start', startCommand);
bot.hears('⏰ Таймер', handleTimerButton);
bot.callbackQuery(callbackRegex(CallbackAction.STOP_TIMER), handleStopTimer);
bot.callbackQuery(CallbackAction.START_TIMER, handleStartTimer);
bot.callbackQuery(callbackRegex(CallbackAction.SET_DESCRIPTION), handleSetDescription);
bot.callbackQuery(callbackRegex(CallbackAction.SET_PROJECT), handleSetProject);
bot.callbackQuery(callbackRegex(CallbackAction.SELECT_PROJECT), handleSelectProject);
bot.callbackQuery(callbackRegex(CallbackAction.CANCEL_PROJECT), handleCancelProject);

bot.on('message:text', async (ctx, next) => {
  const chatId = String(ctx.chat?.id);
  if (pendingDescriptions.has(chatId)) {
    await handleDescriptionText(ctx);
  } else {
    await next();
  }
});

bot.catch((err) => {
  strapi.log.error('Telegram bot error:', err);
});

export function startTelegramBot() {
  bot.start({
    onStart: (botInfo) => {
      strapi.log.info(`Telegram bot @${botInfo.username} started`);
    },
  });
}

export function stopTelegramBot() {
  bot.stop();
}

export { bot };
