/**
 * project controller
 */

import { factories } from '@strapi/strapi';
import { sendForbiddenError, sendNotFoundError } from '../../../shared/lib/response';
import Context from '../../../shared/utils/context';

export default factories.createCoreController('api::project.project', ({ strapi }) => ({
  async create(ctx) {
    const context = new Context(ctx);
    ctx.request.body.data.owner = context.getUserId();
    ctx.request.body.data.members = context.getUserId();

    const response = await super.create(ctx);
    return response;
  },

  async delete(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();
    const { id } = ctx.params;

    const projects = await strapi.documents('api::project.project').findOne({
      documentId: id,
      populate: { owner: true },
    });

    if (!projects) {
      return sendNotFoundError({ message: 'Project not found' });
    }

    if (projects.owner.id !== userId) {
      return sendForbiddenError({ message: 'You can only delete your own projects' });
    }

    const response = await super.delete(ctx);
    return response;
  },
}));
