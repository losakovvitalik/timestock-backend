import { AfterCreateEvent } from '../../../../../types/strapi/lifecycles';
import Context from '../../../../shared/utils/context';
import { ProjectReminderService } from '../../services/project-reminder.service';

export default {
  async afterCreate(event: AfterCreateEvent) {
    const context = strapi.requestContext.get();
    const ctx = new Context(context);

    // При создании напоминания сразу вычисляем время следующего напоминания
    const documentId = event.result.documentId;
    const nextAt = await ProjectReminderService.calcNextTime(documentId);
    await strapi.documents('api::project-reminder.project-reminder').update({
      documentId,
      data: {
        next_at: nextAt,
        user: ctx.getUserId(),
      },
    });
  },
};
