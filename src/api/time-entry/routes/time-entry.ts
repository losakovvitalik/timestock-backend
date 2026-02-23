/**
 * time-entry router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::time-entry.time-entry', {
  config: {
    find: {
      policies: [
        { name: 'global::can-access', config: { relation: 'user' } },
      ],
    },
    findOne: {
      policies: [
        { name: 'global::can-access', config: { relation: 'user' } },
      ],
    },
  },
});
