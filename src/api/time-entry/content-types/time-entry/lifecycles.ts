import { Data } from '@strapi/strapi';
import { AfterUpdateEvent } from '../../../../../types/strapi/lifecycles';

export default {
  async afterUpdate(event: AfterUpdateEvent<Data.ContentType<'api::time-entry.time-entry'>>) {
    if (!event.result.end_time) return;

    const timeEntry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId: event.result.documentId,
      populate: {
        project: true,
      },
    });

    await strapi.documents('api::project.project').update({
      documentId: timeEntry.project.documentId,
      data: {
        time_spent:
          timeEntry.project.time_spent +
          Math.floor(
            (new Date(timeEntry.end_time).getTime() - new Date(timeEntry.start_time).getTime()) /
              1000
          ),
      },
    });
  },
};
