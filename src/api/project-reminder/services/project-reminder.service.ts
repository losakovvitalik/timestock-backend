import { DateTime } from 'luxon';
import { PushService } from '../../../shared/services/push.service';

export class ProjectReminderService {
  static async sendPush(reminderDocumentId: string) {
    const reminder = await strapi.documents('api::project-reminder.project-reminder').findOne({
      documentId: reminderDocumentId,
      populate: {
        user: true,
        project: true,
      },
    });

    await PushService.sendToUser(reminder.user.documentId, {
      title: `Проект "${reminder.project.name}"`,
      text: reminder.text,
    });

    await strapi.documents('api::project-reminder.project-reminder').update({
      documentId: reminderDocumentId,
      data: {
        next_at: await this.calcNextTime(reminderDocumentId),
      },
    });
  }

  static async calcNextTime(reminderDocumentId: string) {
    const reminder = await strapi.documents('api::project-reminder.project-reminder').findOne({
      documentId: reminderDocumentId,
      populate: {
        user: true,
      },
    });

    const options = reminder.recurrence_options as {
      interval: 'DAILY';
      time: string;
    };

    const [hour, minutes] = options.time.split(':');

    const now = DateTime.now().setZone(reminder.user.timezone);
    let next = now.set({ hour: parseInt(hour), minute: parseInt(minutes) });

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
