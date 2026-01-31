import webpush from 'web-push';
import { env } from './shared/config/env';
import { startTelegramBot, stopTelegramBot } from './shared/services/telegram/telegram-bot.service';
import { runSeeds } from './shared/seeds';

webpush.setVapidDetails(
  'mailto:losakovvitalik@gmail.com',
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export default {
  register() {},
  async bootstrap() {
    if (process.env.RUN_SEED === 'true') {
      await runSeeds();
      strapi.log.info('Сид успешно выполнен');
      process.exit(0);
    }
    startTelegramBot();
  },
  async destroy() {
    stopTelegramBot();
  },
};
