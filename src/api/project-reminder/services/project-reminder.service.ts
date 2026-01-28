import { Core } from '@strapi/strapi';
import { DateTime } from 'luxon';
import { NotificationService } from '../../../shared/services/notification/notification.service';
import { NotificationType } from '../../../shared/services/notification/types';

export type RecurrenceOptions = {
  interval: 'DAILY';
  time: string;
};

export class ProjectReminderService {
  static async send(strapi: Core.Strapi, reminderDocumentId: string) {
    const reminder = await strapi.documents('api::project-reminder.project-reminder').findOne({
      documentId: reminderDocumentId,
      populate: {
        user: true,
        project: true,
      },
    });

    await NotificationService.sendToUser(strapi, reminder.user.documentId, {
      title: `Проект "${reminder.project.name}"`,
      text: reminder.text,
      type: NotificationType.PROJECT_REMINDER,
      context: {
        projectDocumentId: reminder.project.documentId,
        reminderDocumentId: reminder.documentId,
      },
    });

    if (reminder.repeatable) {
      await strapi.documents('api::project-reminder.project-reminder').update({
        documentId: reminderDocumentId,
        data: {
          next_at: await this.calcNextTimeByReminder(strapi, reminderDocumentId),
          snoozed_until: null,
        },
      });
    } else {
      await strapi.documents('api::project-reminder.project-reminder').update({
        documentId: reminderDocumentId,
        data: {
          enabled: false,
          snoozed_until: null,
        },
      });
    }
  }

  static async calcNextTimeByReminder(strapi: Core.Strapi, reminderDocumentId: string) {
    const reminder = await strapi.documents('api::project-reminder.project-reminder').findOne({
      documentId: reminderDocumentId,
      populate: {
        user: true,
      },
    });

    const options = reminder.recurrence_options as RecurrenceOptions;

    return this.calcNextTime({
      recurrenceOptions: options,
      userTimezone: reminder.user.timezone,
    });
  }

  static calcNextTime({
    recurrenceOptions,
    userTimezone,
  }: {
    userTimezone: string;
    recurrenceOptions: RecurrenceOptions;
  }) {
    const options = recurrenceOptions as {
      interval: 'DAILY';
      time: string;
    };

    const [hour, minutes] = options.time.split(':');

    const now = DateTime.now().setZone(userTimezone);
    let next = now.set({
      hour: parseInt(hour),
      minute: parseInt(minutes),
      second: 0,
      millisecond: 0,
    });

    // Если сегодня это время уже прошло, то отправлять завтра
    // это нужно при редактировании и создании
    if (next.toJSDate().getTime() < now.toJSDate().getTime()) {
      next = next.plus({
        day: 1,
      });
    }

    return next.toUTC().toJSDate().toISOString();
  }
}
