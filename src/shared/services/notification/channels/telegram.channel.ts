import { Core } from '@strapi/strapi';
import { InlineKeyboard } from 'grammy';
import { bot } from '../../telegram/telegram-bot.service';
import { CallbackAction, createCallback } from '../../telegram/utils/callback-data';
import { NotificationType, type NotificationMessage } from '../types';

export class TelegramChannel {
  static async send(strapi: Core.Strapi, userDocumentId: string, msg: NotificationMessage) {
    const link = await strapi.documents('api::telegram-link.telegram-link').findFirst({
      filters: {
        user: { documentId: userDocumentId },
        notifications_enabled: true,
      },
    });

    if (!link) return;

    try {
      const text = this.formatMessage(msg);
      const keyboard = this.getKeyboard(msg);

      await bot.api.sendMessage(link.chat_id, text, {
        parse_mode: 'Markdown',
        ...(keyboard && { reply_markup: keyboard }),
      });
    } catch (error) {
      strapi.log.error(`Ошибка при отправке Telegram уведомления: ${error}`);
    }
  }

  private static getKeyboard(msg: NotificationMessage): InlineKeyboard | null {
    if (msg.type === NotificationType.PROJECT_REMINDER) {
      const { projectDocumentId, reminderDocumentId } = msg.context;

      return new InlineKeyboard()
        .text(
          '▶️ Запустить таймер',
          createCallback(CallbackAction.START_TIMER_WITH_PROJECT, projectDocumentId)
        )
        .row()
        .text('⏰ 5 мин', createCallback(CallbackAction.SNOOZE_REMINDER, reminderDocumentId, '5'))
        .text('⏰ 15 мин', createCallback(CallbackAction.SNOOZE_REMINDER, reminderDocumentId, '15'))
        .text('⏰ 60 мин', createCallback(CallbackAction.SNOOZE_REMINDER, reminderDocumentId, '60'));
    }

    return null;
  }

  private static formatMessage(msg: NotificationMessage): string {
    if (msg.text) {
      return `*${this.escapeMarkdown(msg.title)}*\n${this.escapeMarkdown(msg.text)}`;
    }
    return `*${this.escapeMarkdown(msg.title)}*`;
  }

  private static escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
  }
}
