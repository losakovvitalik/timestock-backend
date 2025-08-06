// import type { Core } from '@strapi/strapi';

import { subSeconds } from 'date-fns';
import { DateTime, Duration } from 'luxon';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:losakovvitalik@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  async bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    // const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany();

    // for (const timeEntry of timeEntries) {
    //   await strapi.documents('api::time-entry.time-entry').update({
    //     documentId: timeEntry.documentId,
    //     data: {
    //       duration: Math.floor(
    //         (new Date(timeEntry.end_time).getTime() - new Date(timeEntry.start_time).getTime()) /
    //           1000
    //       ),
    //     },
    //   });
    // }



    // console.log(getDatesInterval('2025-07-05', '2025-07-11'))

    // const projects = await strapi.documents('api::project.project').findMany();

    // for (const project of projects) {
    //   const entries = await strapi.documents('api::time-entry.time-entry').findMany({
    //     filters: {
    //       project: {
    //         documentId: project.documentId,
    //       },
    //       end_time: {
    //         $notNull: true,
    //       },
    //     },
    //   });

    //   const spentTime = entries.reduce((prev, entry) => {
    //     const durationSeconds = Math.floor(
    //       (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000
    //     );

    //     return prev + durationSeconds;
    //   }, 0);

    //   await strapi.documents('api::project.project').update({
    //     documentId: project.documentId,
    //     data: {
    //       time_spent: spentTime,
    //     },
    //   });
    // }
  },
};
