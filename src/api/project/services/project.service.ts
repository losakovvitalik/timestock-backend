import { DocumentId } from '../../../../types/strapi/types';

export class ProjectService {
  // обновить общее потраченное время на проект
  static async recalculateTotalDuration(projectDocumentId: DocumentId, additionalValue?: number) {
    const timeSpent = (await this.getTotalDuration(projectDocumentId)) + (additionalValue || 0);
    console.log('timeSpent', timeSpent);

    return await strapi.documents('api::project.project').update({
      documentId: projectDocumentId,
      data: {
        time_spent: timeSpent,
      },
    });
  }

  // получить общее время потраченное на проект
  static async getTotalDuration(documentId: DocumentId): Promise<number> {
    const result = await strapi.db.connection.raw(
      `
    SELECT COALESCE(SUM(te.duration), 0) AS total_duration
    FROM time_entries te
    JOIN time_entries_project_lnk lnk ON te.id = lnk.time_entry_id
    JOIN projects p ON p.id = lnk.project_id
    WHERE p.document_id = ?
  `,
      [documentId]
    );

    return Number(result.rows?.[0]?.total_duration || 0);
  }
}
