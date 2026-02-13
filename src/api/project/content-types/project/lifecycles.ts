import { BeforeDeleteEvent } from '../../../../../types/strapi/lifecycles';

export default {
  async beforeDelete(event: BeforeDeleteEvent) {
    const project = await strapi.documents('api::project.project').findFirst({
      filters: { id: event.params.where.id },
      populate: { project_reminders: true },
    });

    if (!project?.project_reminders?.length) return;

    for (const reminder of project.project_reminders) {
      await strapi.documents('api::project-reminder.project-reminder').delete({
        documentId: reminder.documentId,
      });
    }
  },
};
