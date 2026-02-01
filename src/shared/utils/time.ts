import { DateTime } from 'luxon';

export function getDayRange(day: string, timezone: string) {
  const start = DateTime.fromISO(day, { zone: timezone }).startOf('day');
  const end = start.endOf('day');
  return {
    from: start.toUTC(),
    to: end.toUTC(),
  };
}

export function calculateOverlap(
  entryStart: Date,
  entryEnd: Date,
  dayFrom: DateTime,
  dayTo: DateTime
): number {
  const start = DateTime.fromJSDate(entryStart);
  const end = DateTime.fromJSDate(entryEnd);

  const actualStart = start > dayFrom ? start : dayFrom;
  const actualEnd = end < dayTo ? end : dayTo;

  const duration = actualEnd.diff(actualStart, 'seconds').seconds;
  return Math.max(0, duration);
}

export function getDatesInterval(startISO: string, endISO: string): string[] {
  const start = DateTime.fromISO(startISO);
  const end = DateTime.fromISO(endISO);

  const dates: string[] = [];

  let current = start.startOf('day');
  while (current <= end.startOf('day')) {
    dates.push(current.toISODate()); // формат YYYY-MM-DD
    current = current.plus({ days: 1 });
  }

  return dates;
}

/**
 * Возвращает строку в формате YYYY-MM-DD из ISO datetime строки
 */
export function getDateFromISO(isoDateTime: string): string {
  return DateTime.fromISO(isoDateTime).toISODate();
}
