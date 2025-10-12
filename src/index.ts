import webpush from 'web-push';
import { env } from '@strapi/utils';

webpush.setVapidDetails(
  'mailto:losakovvitalik@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},
  async bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    console.log('JWT_SECURE', typeof env.bool("JWT_SECURE"))
  },
};
