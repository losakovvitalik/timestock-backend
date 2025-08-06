import { Core } from '@strapi/strapi';
import { ProjectReminderService } from '../src/api/project-reminder/services/project-reminder.service';
import { subSeconds } from 'date-fns';
import { DateTime, Duration } from 'luxon';
import { PushService } from '../src/shared/services/push.service';

export default {
  /**
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */
  sendNotifications: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      // Добавить в дальнейшем пагинацию
      const reminders = await strapi.documents('api::project-reminder.project-reminder').findMany({
        filters: {
          next_at: {
            $lte: new Date(),
          },
          enabled: true,
        },
      });

      for (const reminder of reminders) {
        try {
          await ProjectReminderService.sendPush(reminder.documentId);
        } catch (error) {
          strapi.log.error(
            `Error in cron task "sendNotifications", reminderId: ${reminder.documentId}, error: ${error}`
          );
        }
      }
    },
    options: {
      rule: '* * * * *',
    },
  },
  longTrackNotification: {
    // Добавить в дальнейшем пагинацию
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      const MAX_RUNNING_DURATION = Duration.fromObject({ hours: 1 });

      const cutoffTime = DateTime.now().minus(MAX_RUNNING_DURATION).toJSDate();

      const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany({
        filters: {
          end_time: {
            $null: true,
          },
          start_time: {
            $lte: cutoffTime,
          },
          long_track_notified_at: {
            $null: true,
          },
        },
        populate: {
          project: true,
          user: true,
        },
      });

      for (const entry of timeEntries) {
        await PushService.sendToUser(entry.user.documentId, {
          title: 'Ваш таймер все ещё запущен!',
          text: `${entry.project.name}${entry.description ? ': ' + entry.description : ''}`,
        });

        await strapi.documents('api::time-entry.time-entry').update({
          documentId: entry.documentId,
          data: {
            long_track_notified_at: new Date(),
          },
        });
      }
    },
    options: {
      rule: '* * * * *',
    },
  },
};
