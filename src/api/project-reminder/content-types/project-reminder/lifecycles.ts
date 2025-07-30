import { AfterCreateEvent } from '../../../../../types/strapi/lifecycles';
import { ProjectReminderService } from '../../services/project-reminder.service';

export default {
  async afterCreate(event: AfterCreateEvent) {
    const documentId = event.result.documentId;
    const nextAt = await ProjectReminderService.calcNextTime(documentId);
    await strapi.documents('api::project-reminder.project-reminder').update({
      documentId,
      data: {
        next_at: nextAt,
      },
    });
  },
};
