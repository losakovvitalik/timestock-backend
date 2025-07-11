import { Core } from '@strapi/strapi';
import { ProjectReminderService } from '../src/api/project-reminder/services/project-reminder.service';

export default {
  /**
   * List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
   */
  sendNotifications: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
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
      tz: 'Europe/Moscow',
    },
  },
};
