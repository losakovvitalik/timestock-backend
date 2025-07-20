/**
 * app-feedback controller
 */

import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';

export default factories.createCoreController('api::app-feedback.app-feedback', ({ strapi }) => ({
  create(ctx) {
    ctx.request.body.data.user = new Context(ctx).getUserId();
    return super.create(ctx);
  },
}));
