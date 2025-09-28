import { BeforeCreateEvent } from '../../../../shared/types/event';
import Context from '../../../../shared/utils/context';

export default {
  beforeCreate(event: BeforeCreateEvent) {
    const data = event.params.data;
    const ctx = strapi.requestContext.get();
    const context = new Context(ctx);
    data.author = context.getUserId();
  },
};
