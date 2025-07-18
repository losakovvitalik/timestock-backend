import { calculateOverlap, getDayRange } from '../../../shared/utils/time';

export class DailyAggregateService {
  static async getOrCreateForProject({
    date,
    projectDocumentId,
    userId,
  }: {
    projectDocumentId: string;
    date: string;
    userId: number;
  }) {
    const isExisting = await strapi.documents('api::daily-aggregate.daily-aggregate').findFirst({
      filters: {
        date,
        project: {
          documentId: projectDocumentId,
        },
        user: {
          id: userId,
        },
      },
    });

    if (!isExisting) {
      return this.createForProject({ date, projectDocumentId, userId });
    }

    return isExisting;
  }

  static async createForProject({
    date,
    projectDocumentId,
    userId,
  }: {
    projectDocumentId: string;
    date: string;
    userId: number;
  }) {
    const project = await strapi.documents('api::project.project').findOne({
      documentId: projectDocumentId,
      populate: {
        members: {
          filters: {
            id: userId,
          },
        },
      },
    });

    console.log(userId);

    const user = project.members[0];

    if (!user) {
      throw new Error('Этого пользователя нет в проекте');
    }

    const dayRange = getDayRange(date, user.timezone);

    const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany({
      filters: {
        start_time: {
          $lte: dayRange.to.toJSDate(),
        },
        end_time: {
          $gte: dayRange.from.toJSDate(),
        },
      },
    });

    const totalSeconds = timeEntries.reduce((prev, curr) => {
      const duration = calculateOverlap(
        new Date(curr.start_time),
        new Date(curr.end_time),
        dayRange.from,
        dayRange.to
      );

      return duration + prev;
    }, 0);

    console.log(totalSeconds);

    return await strapi.documents('api::daily-aggregate.daily-aggregate').create({
      data: {
        date: date,
        project: projectDocumentId,
        user: userId,
        duration: Math.floor(totalSeconds) || 0,
      },
    });
  }
}
