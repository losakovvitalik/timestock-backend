export interface ActiveTimer {
  documentId: string;
  start_time: string | Date;
  description: string | null;
  project: {
    name: string;
  } | null;
}

export async function getActiveTimer(chatId: string): Promise<ActiveTimer | null> {
  const telegramLink = await strapi.documents('api::telegram-link.telegram-link').findFirst({
    filters: { chat_id: chatId },
    populate: ['user'],
  });

  if (!telegramLink?.user) {
    return null;
  }

  const userId = telegramLink.user.id;

  const activeEntry = await strapi.documents('api::time-entry.time-entry').findFirst({
    filters: {
      user: { id: userId },
      end_time: { $null: true },
    },
    populate: ['project'],
  });

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

export function formatDuration(startTime: string | Date, endTime: string | Date = new Date()): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  return `${minutes}м ${seconds}с`;
}

interface TimerMessageData {
  start_time?: string | Date;
  description?: string | null;
  project?: { name?: string } | null;
}

export function formatTimerMessage(timer: TimerMessageData): string {
  const duration = formatDuration(timer.start_time);
  const projectName = timer.project?.name ?? 'Без проекта';
  const description = timer.description ? `\n${timer.description}` : '';
  return `⏰ ${projectName} - ${duration}${description}`;
}
