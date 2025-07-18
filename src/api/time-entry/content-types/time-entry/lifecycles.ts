import { Data } from '@strapi/strapi';
import { AfterUpdateEvent } from '../../../../../types/strapi/lifecycles';
import { getDatesInterval } from '../../../../shared/utils/time';
import { DailyAggregateService } from '../../../daily-aggregate/services/daily-aggregate.service';

export default {
  async beforeUpdate(event) {
    console.log(event);
  },
  async afterUpdate(event: AfterUpdateEvent<Data.ContentType<'api::time-entry.time-entry'>>) {
    if (!event.result.end_time) return;

    const timeEntry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId: event.result.documentId,
      populate: {
        project: true,
        user: true,
      },
    });

    const dates = new Set(
      getDatesInterval(String(timeEntry.start_time), String(timeEntry.end_time))
    );

    console.log(dates);

    for (const date of dates) {
      await DailyAggregateService.recalculateForProject({
        date,
        projectDocumentId: timeEntry.project.documentId,
        userId: timeEntry.user.id,
      });
    }

    // При завершении трека добавляем потраченное время в общее время проекта
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
