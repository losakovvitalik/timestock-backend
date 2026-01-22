import { Bot } from 'grammy';
import { env } from '../../config/env';
import { startCommand } from './commands/start';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.command('start', startCommand);

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
