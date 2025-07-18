/**
 * daily-aggregate controller
 */

import { factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import { validatePayload } from '../../../shared/lib/validate-payload';
import { dailyAggregateGetByProjectQuerySchema } from '../schemas/daily-aggregate-get-by-project-schemas';
import { getDatesBetween } from '../../../shared/utils/time';
import { DailyAggregateService } from '../services/daily-aggregate.service';

export default factories.createCoreController(
  'api::daily-aggregate.daily-aggregate',
  ({ strapi }) => ({
    async getByProject(ctx) {
      const context = new Context(ctx);
      const rawParams = context.getQueryParams();

      const params = validatePayload(dailyAggregateGetByProjectQuerySchema, rawParams);

      const dates = getDatesBetween(params.from, params.to);

      const results = [];

      for (const date of dates) {
        results.push(
          await DailyAggregateService.getOrCreateForProject({
            date: date,
            projectDocumentId: params.projectId,
            userId: context.getUserId(),
          })
        );
      }

      const sanitizedResults = await this.sanitizeOutput(results, ctx);

      return this.transformResponse(sanitizedResults);
    },
  })
);
