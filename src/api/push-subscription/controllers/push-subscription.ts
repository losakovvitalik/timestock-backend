import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import { sendNotFoundError, sendResponse, sendValidationError } from '../../../shared/lib/response';

export default factories.createCoreController('api::push-subscription.push-subscription', {
  async findMy(ctx) {
    const context = new Context(ctx);
    const userId = context.getUserId();
    const endpoint = context.getQueryParams<string>('endpoint');

    if (!endpoint) {
      return sendValidationError({ message: 'endpoint is required' });
    }

    const subscriptions = await strapi
      .documents('api::push-subscription.push-subscription')
      .findMany({
        filters: { user: { id: userId } },
      });

    const match = subscriptions.find((sub: any) => sub.subscription?.endpoint === endpoint);

    if (!match) {
      return sendNotFoundError({ message: 'Subscription not found' });
    }

    return sendResponse({ data: match });
  },
});
