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
      /**
       * если привязали к новому проекту
       * то пересчитываем общее потраченное время для обоих проектов
       */
      if (oldEntity.project && data.project) {
        await ProjectService.recalculateTotalDuration(newProjectId);
        await ProjectService.recalculateTotalDuration(oldProjectId);
        return;
      }

      /**
       * если привязали к проекту и
       * до этого проект не был указан
       */
      if (oldEntity.project === null && data.project) {
        await ProjectService.recalculateTotalDuration(newProjectId);
        return;
      }

      /**
       * если отвязали сущность от проекта,
       * то пересчитываем время для проекта,
       * который был привязан до изменений
       */
      if (data.project === null) {
        await ProjectService.recalculateTotalDuration(oldProjectId);
        return;
      }

      /**
       * если изменил только время начала
       * или время конца трека времени
       */
      if (data.start_time || data.end_time) {
        await ProjectService.recalculateTotalDuration(oldProjectId);
        return;
      }
    }

    return res;
  },
});
