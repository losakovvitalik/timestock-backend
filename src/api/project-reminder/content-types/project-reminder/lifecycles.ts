import {
  AfterCreateEvent,
  BeforeUpdateEvent
} from '../../../../../types/strapi/lifecycles';
import { ProjectReminderService, RecurrenceOptions } from '../../services/project-reminder.service';

export default {
  async afterCreate(event: AfterCreateEvent) {
    const documentId = event.result.documentId;
    const nextAt = await ProjectReminderService.calcNextTimeByReminder(documentId);
    await strapi.documents('api::project-reminder.project-reminder').update({
      documentId,
      data: {
        next_at: nextAt,
      },
    });
  },
  async beforeUpdate(event: BeforeUpdateEvent) {
    const data = event.params.data;

    if (data.enabled || data.recurrence_options) {
      const projectReminder = await strapi
        .documents('api::project-reminder.project-reminder')
        .findFirst({
          filters: {
            id: event.params.where.id,
          },
          populate: {
            user: true,
          },
        });

      const recurrenceOptions = projectReminder.recurrence_options as RecurrenceOptions | undefined;

      if (recurrenceOptions) {
        // Тут важен порядок, надо сначала проверять recurrence_options и только потом enabled
        if (data.recurrence_options) {
          data.next_at = ProjectReminderService.calcNextTime({
            userTimezone: projectReminder.user.timezone,
            recurrenceOptions: data.recurrence_options,
          });
        } else if (data.enabled) {
          data.next_at = ProjectReminderService.calcNextTime({
            recurrenceOptions: recurrenceOptions,
            userTimezone: projectReminder.user.timezone,
          });
        }
      }
    }
  },
};
