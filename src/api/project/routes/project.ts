/**
 * project router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::project.project', {
  config: {
    find: {
      policies: [
        { name: 'global::can-access', config: { relation: 'members' } },
      ],
    },
    findOne: {
      policies: [
        { name: 'global::can-access', config: { relation: 'members' } },
      ],
    },
  },
});
