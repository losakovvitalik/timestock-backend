import { DocumentId } from '../../../../types/strapi/types';
import { ProjectService } from '../../project/services/project.service';
import {
  TimerError,
  type StopTimerResult,
  type StartTimerResult,
  type GetActiveTimerResult,
  type SetProjectResult,
  type SetDescriptionResult,
  type UpdateEntryResult,
  type UpdateEntryData,
} from './time-entry.service.types';

export class TimeEntryService {
  /**
   * Запуск нового таймера
   * - Проверяет нет ли уже активного таймера
   * - Создаёт новую запись с start_time
   */
  static async startTimer(userId: number, projectId?: DocumentId): Promise<StartTimerResult> {
    const activeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
      filters: {
        user: { id: userId },
        end_time: { $null: true },
      },
      populate: ['project'],
    });

    if (activeEntry) {
      return { success: false, reason: TimerError.ALREADY_RUNNING, activeEntry };
    }

    const entry = await strapi.documents('api::time-entry.time-entry').create({
      data: {
        start_time: new Date().toISOString(),
        user: userId,
        ...(projectId && { project: projectId }),
      },
      populate: ['project'],
    });

    return { success: true, entry };
  }

  /**
   * Остановка таймера по documentId
   * - Проверяет существование записи
   * - Проверяет что запись принадлежит пользователю
   * - Проверяет что таймер ещё не остановлен
   * - Вычисляет duration
   * - Обновляет запись
   * - Пересчитывает время проекта если привязан
   */
  static async stopTimer(documentId: DocumentId, userId: number): Promise<StopTimerResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project', 'user'],
    });

    if (!entry) {
      return { success: false, reason: TimerError.NOT_FOUND };
    }

    if (entry.user?.id !== userId) {
      return { success: false, reason: TimerError.FORBIDDEN };
    }

    if (entry.end_time) {
      return { success: false, reason: TimerError.ALREADY_STOPPED };
    }

    const endTime = new Date();
    const startTime = new Date(entry.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const updatedEntry = await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data: {
        end_time: endTime.toISOString(),
        duration,
      },
      populate: ['project'],
    });

    if (entry.project?.documentId) {
      await ProjectService.recalculateTotalDuration(entry.project.documentId);
    }

    return {
      success: true,
      entry: updatedEntry,
      duration,
      startTime,
      endTime,
    };
  }

  /**
   * Получение time-entry по documentId
   */
  static async findOne(documentId: DocumentId): Promise<GetActiveTimerResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project'],
    });

    return entry ?? null;
  }

  /**
   * Получение активного таймера пользователя
   */
  static async getActiveTimer(userId: number): Promise<GetActiveTimerResult> {
    const activeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
      filters: {
        user: { id: userId },
        end_time: { $null: true },
      },
      populate: ['project'],
    });

    return activeEntry ?? null;
  }

  /**
   * Универсальный метод обновления записи
   * - Проверяет существование записи
   * - Проверяет что таймер ещё активен
   * - Обновляет переданные поля
   */
  private static async updateEntry(
    documentId: DocumentId,
    data: UpdateEntryData
  ): Promise<UpdateEntryResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
    });

    if (!entry) {
      return { success: false, reason: TimerError.NOT_FOUND };
    }

    if (entry.end_time) {
      return { success: false, reason: TimerError.ALREADY_STOPPED };
    }

    const updatedEntry = await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data,
      populate: ['project'],
    });

    return { success: true, entry: updatedEntry };
  }

  /**
   * Привязка проекта к time-entry
   */
  static async setProject(
    documentId: DocumentId,
    projectId: DocumentId | null
  ): Promise<SetProjectResult> {
    return this.updateEntry(documentId, { project: projectId });
  }

  /**
   * Обновление описания time-entry
   */
  static async setDescription(
    documentId: DocumentId,
    description: string
  ): Promise<SetDescriptionResult> {
    return this.updateEntry(documentId, { description });
  }
}
