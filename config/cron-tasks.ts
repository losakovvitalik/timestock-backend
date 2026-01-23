import { Core } from '@strapi/strapi';
import { DateTime, Duration } from 'luxon';
import { ProjectReminderService } from '../src/api/project-reminder/services/project-reminder.service';
import { PushService } from '../src/shared/services/push.service';

export default {
  /**
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */
  sendNotifications: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      try {
        // TODO: Добавить в дальнейшем пагинацию
        const reminders = await strapi
          .documents('api::project-reminder.project-reminder')
          .findMany({
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
      } catch (error) {
        console.error(error);
      }
    },
    options: {
      rule: '* * * * *',
    },
  },
  longTrackNotification: {
    // Добавить в дальнейшем пагинацию
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      try {
        const MAX_RUNNING_DURATION = Duration.fromObject({ hours: 8 });

        const cutoffTime = DateTime.now().minus(MAX_RUNNING_DURATION).toJSDate();

        const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany({
          filters: {
            end_time: {
              $null: true,
            },
            start_time: {
              $lte: cutoffTime,
            },
            $or: [
              {
                long_track_notified_at: {
                  $lte: cutoffTime,
                },
              },
              {
                long_track_notified_at: {
                  $null: true,
                },
              },
            ],
          },
          populate: {
            project: true,
            user: {
              fields: [],
            },
          },
        });

        for (const entry of timeEntries) {
          let msg: string = '';
          if (entry.project) {
            msg += `${entry.project.name}: `;
          }

          if (entry.description) {
            msg += `${entry.description}`;
          }

          await PushService.sendToUser(entry.user.documentId, {
            title: 'Ваш таймер все ещё запущен!',
            ...(msg ? { text: msg } : {}),
          });

          await strapi.documents('api::time-entry.time-entry').update({
            documentId: entry.documentId,
            data: {
              long_track_notified_at: new Date(),
            },
          });
        }
      } catch (error) {
        console.error(`Error in CRON task longTrackNotification: ${error}`);
      }
    },
    options: {
      rule: '* * * * *',
    },
  },
  cleanupExpiredTelegramTokens: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      try {
        const expiredTokens = await strapi.documents('api::telegram-token.telegram-token').findMany({
          filters: {
            $or: [
              { expires_at: { $lt: new Date() } },
              { used: true },
            ],
          },
        });

        for (const token of expiredTokens) {
          await strapi.documents('api::telegram-token.telegram-token').delete({
            documentId: token.documentId,
          });
        }

        if (expiredTokens.length > 0) {
          strapi.log.info(`Cleaned up ${expiredTokens.length} expired/used telegram tokens`);
        }
      } catch (error) {
        strapi.log.error(`Error in CRON task cleanupExpiredTelegramTokens: ${error}`);
      }
    },
    options: {
      // Каждый день в 3:00 ночи
      rule: '0 3 * * *',
    },
  },
};
