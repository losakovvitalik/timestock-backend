import { DateTime } from 'luxon'

export function getDayRange(day: string, timezone: string) {
  const start = DateTime.fromISO(day, { zone: timezone }).startOf('day');
  const end = start.endOf('day');
  return {
    from: start.toUTC(),
    to: end.toUTC()
  }
}

export function calculateOverlap(entryStart: Date, entryEnd: Date, dayFrom: DateTime, dayTo: DateTime): number {
  const start = DateTime.fromJSDate(entryStart);
  const end = DateTime.fromJSDate(entryEnd);

  const actualStart = start > dayFrom ? start : dayFrom;
  const actualEnd = end < dayTo ? end : dayTo;

  const duration = actualEnd.diff(actualStart, 'seconds').seconds;
  return Math.max(0, duration);
}