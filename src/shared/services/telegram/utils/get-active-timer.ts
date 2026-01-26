import { TimeEntryService } from '../../../../api/time-entry/services/time-entry.service';
import { getUserByChatId } from './telegram-link';

export interface ActiveTimer {
  documentId: string;
  start_time: string | Date;
  description: string | null;
  project: {
    name: string;
  } | null;
}

export async function getActiveTimer(chatId: string): Promise<ActiveTimer | null> {
  const user = await getUserByChatId(chatId);

  if (!user) {
    return null;
  }

  const activeEntry = await TimeEntryService.getActiveTimer(user.id);

  if (!activeEntry) {
    return null;
  }

  return {
    documentId: activeEntry.documentId,
    start_time: activeEntry.start_time,
    description: activeEntry.description,
    project: activeEntry.project ? { name: activeEntry.project.name } : null,
  };
}
