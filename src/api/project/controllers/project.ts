/**
 * project controller
 */

import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async create(ctx) {
    const context = new Context(ctx);
    ctx.request.body.data.owner = context.getUserId();
    ctx.request.body.data.members = context.getUserId();

    // Proceed with the default create logic
    const response = await super.create(ctx);
    return response;
  },
}));
