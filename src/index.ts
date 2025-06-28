// import type { Core } from '@strapi/strapi';

import webpush, { PushSubscription, WebPushError } from 'web-push';
import { PushService } from './shared/services/push.service';

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
    const push = await strapi.documents('api::push-subscription.push-subscription').findMany();

    await PushService.sendToUser('tr9tx5r6so21m9ecu262dq81', {
      text: 'Текст',
      title: 'Заголовок',
    });
  },
};
