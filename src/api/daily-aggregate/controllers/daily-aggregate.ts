/**
 * daily-aggregate controller
 */

import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';

export default factories.createCoreController(
  'api::daily-aggregate.daily-aggregate',
  ({ strapi }) => ({
    getByProject(ctx) {
      const context = new Context(ctx);
      const queryParams = context.getQueryParams()

      
    },
  })
);
