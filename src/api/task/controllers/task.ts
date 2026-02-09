/**
 * task controller
 */

import { factories } from '@strapi/strapi'
import Context from '../../../shared/utils/context';
import { sendNotFoundError, sendForbiddenError, sendResponse } from '../../../shared/lib/response';

export default factories.createCoreController('api::task.task', ({strapi}) => ({
  async archive(ctx) {
    const context = new Context(ctx);
    const { id } = context.getParams();
    const userId = context.getUserId();

    const task = await strapi.documents('api::task.task').findOne({
      documentId: id,
      populate: ['author'],
    });

    if (!task) {
      return sendNotFoundError({ message: 'Task not found' });
    }

    if (task.author?.id !== userId) {
      return sendForbiddenError({ message: 'Access denied' });
    }

    const updated = await strapi.documents('api::task.task').update({
      documentId: id,
      data: {
        is_archived: !task.is_archived,
      },
    });

    return sendResponse({ data: updated });
  },
}));
