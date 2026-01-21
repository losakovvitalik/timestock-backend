import webpush from 'web-push';
import { env } from './shared/config/env';
import { startTelegramBot, stopTelegramBot } from './shared/services/telegram-bot.service';

webpush.setVapidDetails(
  'mailto:losakovvitalik@gmail.com',
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export default {
  register() {},
  async bootstrap() {
    startTelegramBot();
  },
  async destroy() {
    stopTelegramBot();
  },
};
