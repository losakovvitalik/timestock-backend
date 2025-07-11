import { addDays, set } from 'date-fns';
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
      title: `${reminder.project.name} | TimeStock`,
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
    });

    const options = reminder.recurrence_options as {
      interval: 'DAILY';
      time: string;
    };

    const tomorrow = addDays(new Date(), 1);
    const [hours, minutes] = options.time.split(':');

    return set(tomorrow, { hours: parseInt(hours), minutes: parseInt(minutes) });
  }
}
