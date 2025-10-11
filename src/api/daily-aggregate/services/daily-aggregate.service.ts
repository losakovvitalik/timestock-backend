import { calculateOverlap, getDayRange } from '../../../shared/utils/time';

type Payload = {
  projectDocumentId: string;
  date: string;
  userId: number | string;
};

export class DailyAggregateService {
  static async getOrCreateForProject({ date, projectDocumentId, userId }: Payload) {
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

  static async createForProject({ date, projectDocumentId, userId }: Payload) {
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

    const user = project.members[0];
    if (!user) {
      throw new Error('Этого пользователя нет в проекте');
    }

    const totalSeconds = await this.calculateDuration({
      date,
      projectDocumentId,
      timezone: user.timezone,
    });

    return await strapi.documents('api::daily-aggregate.daily-aggregate').create({
      data: {
        date: date,
        project: projectDocumentId,
        user: userId,
        duration: Math.floor(totalSeconds) || 0,
      },
    });
  }

  static async recalculateForProject({ date, projectDocumentId, userId }: Payload) {
    const dailyAggregate = await strapi
      .documents('api::daily-aggregate.daily-aggregate')
      .findFirst({
        filters: {
          user: {
            id: userId,
          },
          project: {
            documentId: projectDocumentId,
          },
          date: date,
        },
        populate: {
          project: {
            populate: {
              members: {
                filters: {
                  id: userId,
                },
              },
            },
          },
        },
      });

    if (!dailyAggregate) {
      return;
    }

    const project = dailyAggregate.project;
    const user = project.members[0];

    if (!user) {
      throw new Error('Этого пользователя нет в проекте');
    }

    const totalSeconds = await this.calculateDuration({
      date,
      projectDocumentId,
      timezone: user.timezone,
    });

    return await strapi.documents('api::daily-aggregate.daily-aggregate').update({
      documentId: dailyAggregate.documentId,
      data: {
        duration: totalSeconds,
      },
    });
  }

  private static async calculateDuration({
    date,
    timezone,
    projectDocumentId,
  }: {
    date: string;
    timezone: string;
    projectDocumentId: string;
  }): Promise<number> {
    // TODO: в будущем стоит переделать на агрегацию времени с помощью SQL
    const dayRange = getDayRange(date, timezone);

    const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany({
      filters: {
        project: {
          documentId: projectDocumentId,
        },
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

    return Math.floor(totalSeconds);
  }
}
