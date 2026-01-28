import { Core } from '@strapi/strapi';
import webpush, { PushSubscription, WebPushError } from 'web-push';
import type { NotificationMessage } from '../types';

export class PushChannel {
  static async send(strapi: Core.Strapi, userDocumentId: string, msg: NotificationMessage) {
    const subs = await strapi.documents('api::push-subscription.push-subscription').findMany({
      filters: {
        user: {
          documentId: userDocumentId,
        },
      },
    });

    for (const sub of subs) {
      const pushSub = sub.subscription as unknown as PushSubscription;

      try {
        await webpush.sendNotification(
          pushSub,
          JSON.stringify({
            title: msg.title,
            body: msg.text,
          })
        );
      } catch (error) {
        strapi.log.error(`Ошибка при отправке push уведомления: ${error}`);

        if (error instanceof WebPushError) {
          if (error.statusCode === 410) {
            await strapi.documents('api::push-subscription.push-subscription').delete({
              documentId: sub.documentId,
            });
          }
        }
      }
    }
  }
}
