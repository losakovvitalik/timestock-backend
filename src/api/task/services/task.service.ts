export class TaskService {
  static async recalculateForTask(taskDocumentId: string) {
    // TODO: в будущем стоит переделать на агрегацию времени с помощью SQL
    const timeEntries = await strapi.documents('api::time-entry.time-entry').findMany({
      filters: {
        task: {
          documentId: taskDocumentId,
        },
      },
    });

    const totalSeconds = timeEntries.reduce((prev, curr) => {
      return prev + (curr.duration || 0);
    }, 0);

    await strapi.documents('api::task.task').update({
      documentId: taskDocumentId,
      data: {
        time_spent: totalSeconds,
      },
    });
  }
}
