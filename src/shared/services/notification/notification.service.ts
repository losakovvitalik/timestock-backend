import { PushChannel } from './channels/push.channel';
import { TelegramChannel } from './channels/telegram.channel';
import type { NotificationMessage } from './types';

export class NotificationService {
  /**
   * Отправка уведомления пользователю во все доступные каналы
   */
  static async sendToUser(userDocumentId: string, msg: NotificationMessage) {
    await Promise.allSettled([
      PushChannel.send(userDocumentId, msg),
      TelegramChannel.send(userDocumentId, msg),
    ]);
  }
}
