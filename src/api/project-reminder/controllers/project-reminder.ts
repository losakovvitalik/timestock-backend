/**
 * project-reminder controller
 */

import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';

export default factories.createCoreController(
  'api::project-reminder.project-reminder',
  ({ strapi }) => ({
    create(ctx) {
      const context = new Context(ctx);

      context.getBody().data.user = context.getUserId();

      return super.create(ctx);
    },
  })
);
