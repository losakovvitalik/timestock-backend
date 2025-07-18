// import type { Core } from '@strapi/strapi';

import webpush from 'web-push';
import { calculateOverlap, getDatesInterval, getDayRange } from './shared/utils/time';

webpush.setVapidDetails(
  'mailto:losakovvitalik@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {


    console.log(getDatesInterval('2025-07-05', '2025-07-11'))



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
