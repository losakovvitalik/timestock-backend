import { Data } from '@strapi/strapi';
import {
  AfterUpdateEvent,
  BeforeDeleteEvent,
  BeforeUpdateEvent,
} from '../../../../../types/strapi/lifecycles';
import { getDatesInterval } from '../../../../shared/utils/time';
import { DailyAggregateService } from '../../../daily-aggregate/services/daily-aggregate.service';
import { ProjectService } from '../../../project/services/project.service';
import { BeforeCreateEvent } from '../../../../shared/types/event';
import { TaskService } from '../../../task/services/task.service';

export default {
  async beforeCreate(
    event: BeforeCreateEvent<{
      end_time?: string;
      start_time?: string;
      duration?: number;
      project: { set: { id: number }[] };
    }>
  ) {
    if (event?.params?.data?.end_time) {
      event.params.data.duration = Math.floor(
        (new Date(event.params.data.end_time).getTime() -
          new Date(event.params.data.start_time).getTime()) /
          1000
      );
    }
  },
  async beforeUpdate(
    event: BeforeUpdateEvent<{
      end_time?: string;
      start_time?: string;
      duration?: number;
      project: { set: { id: number }[] };
    }>
  ) {
    if (event?.params?.data?.end_time) {
      const timeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
        filters: {
          id: event.params.where.id,
        },
        populate: {
          project: true,
        },
      });

      event.params.data.duration = Math.floor(
        (new Date(event.params.data.end_time).getTime() -
          new Date(event.params.data.start_time || timeEntry.start_time).getTime()) /
          1000
      );
    }
  },
  async afterUpdate(event: AfterUpdateEvent<Data.ContentType<'api::time-entry.time-entry'>>) {
    /**
     * если после обновление у трека времени, до сих пор нет конечного времени
     * (прим. изменили проект), то пересчитывать ещё пока ничего не нужно
     * TODO: сделать чтоб время пересчитывалось даже когда трек активен
     */
    if (!event.result.end_time) return;

    const timeEntry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId: event.result.documentId,
      populate: {
        project: true,
        user: true,
        task: true,
      },
    });

    // если трек времени привязан к задаче, то пересчитываем потраченное время
    if (timeEntry?.task) {
      await TaskService.recalculateForTask(timeEntry.task.documentId);
    }

    // если трек времени привязан к проекту, то пересчитываем потраченное время
    if (timeEntry.project) {
      const dates = new Set(
        getDatesInterval(String(timeEntry.start_time), String(timeEntry.end_time))
      );

      for (const date of dates) {
        await DailyAggregateService.recalculateForProject({
          date,
          projectDocumentId: timeEntry.project.documentId,
          userId: timeEntry.user.id,
        });
      }
    }
  },
  async beforeDelete(event: BeforeDeleteEvent) {
    /**
     * пересчет общего времени и за определенные даты
     * при удалении трека времени
     */
    const timeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
      filters: {
        id: event?.params?.where?.id,
      },
      populate: {
        project: true,
        user: true,
      },
    });

    if (timeEntry.project) {
      const dates = new Set(
        getDatesInterval(String(timeEntry.start_time), String(timeEntry.end_time))
      );

      for (const date of dates) {
        await DailyAggregateService.recalculateForProject({
          date,
          projectDocumentId: timeEntry.project.documentId,
          userId: timeEntry.user.id,
        });

        await ProjectService.recalculateTotalDuration(
          timeEntry.project.documentId,
          -timeEntry.duration
        );
      }
    }
  },
};
