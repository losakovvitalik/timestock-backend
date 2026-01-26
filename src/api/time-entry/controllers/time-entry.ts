/**
 * time-entry controller
 */

import { Data, factories } from '@strapi/strapi';
import Context from '../../../shared/utils/context';
import { ProjectService } from '../../project/services/project.service';
import { TimeEntryService } from '../services/time-entry.service';
import { TimerError } from '../services/time-entry.service.types';
import {
  sendError,
  sendForbiddenError,
  sendNotFoundError,
  sendResponse,
} from '../../../shared/lib/response';

export default factories.createCoreController('api::time-entry.time-entry', {
  async stop(ctx) {
    const context = new Context(ctx);
    const documentId = context.getParams().id;
    const userId = context.getUserId();

    const result = await TimeEntryService.stopTimer(documentId, userId);

    if (result.success === false) {
      if (result.reason === TimerError.NOT_FOUND) {
        return sendNotFoundError({ message: 'Таймер не найден' });
      }
      if (result.reason === TimerError.FORBIDDEN) {
        return sendForbiddenError({ message: 'Нет доступа к этому таймеру' });
      }
      return sendError({ code: 'ALREADY_STOPPED', message: 'Таймер уже остановлен' });
    }

    return sendResponse({ data: result.entry });
  },

  async create(ctx) {
    const context = new Context(ctx);
    const body = context.getBody();

    body.data.user = context.getUserId();
    const res = await super.create(ctx);

    if (body.data.end_time && body.data.project) {
      await ProjectService.recalculateTotalDuration(body.data.project);
    }

    return res;
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
      } else if (oldEntity.project && (data.start_time || data.end_time)) {
        /**
         * если изменил только время начала
         * или время конца трека времени
         * и при этом до этого уже был указан проект
         */
        await ProjectService.recalculateTotalDuration(oldProjectId);
      }
    }

    return res;
  },
});
