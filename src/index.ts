// import type { Core } from '@strapi/strapi';

import webpush from 'web-push';

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
    await webpush.sendNotification(
      {
        endpoint:
          'https://fcm.googleapis.com/fcm/send/fiPpIP4OOyw:APA91bG4FHj4kniofdS97H3avCxeXqWubx3eCjBuDe3h_8q4aNpj3DwojzRziLYdxPAI5WSZMNw9MmCGPOFf8v74Hi2s7qHtqh2QOWcT7HrYCJUsl8GwrCrLSDUdcYOt9iCB8_FAF3vb',
        expirationTime: null,
        keys: {
          p256dh:
            'BEYJ2bkHm2t9zHIS_nKtWxTSUB1qkiiW982kQqELGbiscXsIShWFhAFNy-FsilplnW_va4-fdatlUp7QSp_cVGA',
          auth: 'cySeC3pzYiwqTNv9DIPYDQ',
        },
      },
      JSON.stringify({
        title: 'Test Notification',
        body: 'message',
        icon: '/icon.png',
      })
    );
  },
};
