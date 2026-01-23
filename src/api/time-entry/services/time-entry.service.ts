import { DocumentId } from '../../../../types/strapi/types';
import { ProjectService } from '../../project/services/project.service';
import type {
  StopTimerResult,
  StartTimerResult,
  GetActiveTimerResult,
  SetProjectResult,
  SetDescriptionResult,
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
      return { success: false, reason: 'already_running', activeEntry };
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
   * - Проверяет что таймер ещё не остановлен
   * - Вычисляет duration
   * - Обновляет запись
   * - Пересчитывает время проекта если привязан
   */
  static async stopTimer(documentId: DocumentId): Promise<StopTimerResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
      populate: ['project'],
    });

    if (!entry) {
      return { success: false, reason: 'not_found' };
    }

    if (entry.end_time) {
      return { success: false, reason: 'already_stopped' };
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
   * Привязка проекта к time-entry
   * - Проверяет существование записи
   * - Проверяет что таймер ещё активен
   * - Обновляет проект
   */
  static async setProject(
    documentId: DocumentId,
    projectId: DocumentId | null
  ): Promise<SetProjectResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
    });

    if (!entry) {
      return { success: false, reason: 'not_found' };
    }

    if (entry.end_time) {
      return { success: false, reason: 'already_stopped' };
    }

    const updatedEntry = await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data: { project: projectId },
      populate: ['project'],
    });

    return { success: true, entry: updatedEntry };
  }

  /**
   * Обновление описания time-entry
   * - Проверяет существование записи
   * - Проверяет что таймер ещё активен
   * - Обновляет описание
   */
  static async setDescription(
    documentId: DocumentId,
    description: string
  ): Promise<SetDescriptionResult> {
    const entry = await strapi.documents('api::time-entry.time-entry').findOne({
      documentId,
    });

    if (!entry) {
      return { success: false, reason: 'not_found' };
    }

    if (entry.end_time) {
      return { success: false, reason: 'already_stopped' };
    }

    const updatedEntry = await strapi.documents('api::time-entry.time-entry').update({
      documentId,
      data: { description },
      populate: ['project'],
    });

    return { success: true, entry: updatedEntry };
  }
}
