/**
 * time-entry controller
 */

import { Data, factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import { ProjectService } from '../../project/services/project.service';

export default factories.createCoreController('api::time-entry.time-entry', {
  create(ctx) {
    const context = new Context(ctx);
    context.getBody().data.user = context.getUserId();

    return super.create(ctx);
  },
  async update(ctx) {
    /**
     * В идеале - выносить подобную логику в лайфхуки, на случай, если
     * обновление сущности произойдёт не из-за действия пользователя.
     * Но так как на текущий момент обновление треков времени планируется
     * только при действии пользователя, а выносить сразу в хуки — слишком трудоёмко
     * и необоснованно усложняет логику, пересчёт был реализован в контроллере.
     */
    const context = new Context(ctx);
    const body = context.getBody();
    const data = body.data;

    const oldEntity: Data.ContentType<'api::time-entry.time-entry'> = await strapi
      .documents('api::time-entry.time-entry')
      .findOne({
        documentId: context.getParams().id,
        populate: {
          project: true,
        },
      });

    const res = await super.update(ctx);

    const oldProjectId = oldEntity.project?.documentId;
    const newProjectId =
      typeof data.project === 'string' ? data.project : (data.project?.documentId ?? null);

    if (oldEntity) {
      if (oldEntity.project && data.project) {
        /**
         * если привязали к новому проекту
         * то пересчитываем общее потраченное время для обоих проектов
         */
        await ProjectService.recalculateTotalDuration(newProjectId);
        await ProjectService.recalculateTotalDuration(oldProjectId);
      } else if (oldEntity.project === null && data.project) {
        /**
         * если привязали к проекту и
         * до этого проект не был указан
         */
        await ProjectService.recalculateTotalDuration(newProjectId);
      } else if (data.project === null) {
        /**
         * если отвязали сущность от проекта,
         * то пересчитываем время для проекта,
         * который был привязан до изменений
         */
        await ProjectService.recalculateTotalDuration(oldProjectId);
      } else if (data.start_time || data.end_time) {
        /**
         * если изменил только время начала
         * или время конца трека времени
         */
        await ProjectService.recalculateTotalDuration(oldProjectId);
      }
    }

    return res;
  },
});
