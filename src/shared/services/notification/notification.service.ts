import { Core } from '@strapi/strapi';
import { PushChannel } from './channels/push.channel';
import { TelegramChannel } from './channels/telegram.channel';
import type { NotificationMessage } from './types';

export class NotificationService {
  /**
   * Отправка уведомления пользователю во все доступные каналы
   */
  static async sendToUser(strapi: Core.Strapi, userDocumentId: string, msg: NotificationMessage) {
    await Promise.allSettled([
      PushChannel.send(strapi, userDocumentId, msg),
      TelegramChannel.send(strapi, userDocumentId, msg),
    ]);
  }
}
