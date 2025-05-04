import { BeforeCreateEvent } from '../../../../shared/types/event';
import Context from '../../../../shared/utils/context';

export default {
  beforeCreate(event: BeforeCreateEvent<{ user: number }>) {
    const ctx = strapi.requestContext.get();
    const context = new Context(ctx);
    const userId = context.getUserId();

    event.params.data.user = userId;
  },
};
