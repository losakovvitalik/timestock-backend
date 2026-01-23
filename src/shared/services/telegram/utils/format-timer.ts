export function formatDuration(
  startTime: string | Date,
  endTime: string | Date = new Date()
): string {
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
