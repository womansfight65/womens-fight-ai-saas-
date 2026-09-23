import {
  addDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from 'date-fns';

export const DATE_FMT = 'yyyy-MM-dd';

export function todayISO(): string {
  return format(new Date(), DATE_FMT);
}

export function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

export function formatDate(value: string | Date, pattern = 'd MMM yyyy'): string {
  try {
    return format(toDate(value), pattern);
  } catch {
    return String(value);
  }
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, "d MMM yyyy 'at' h:mm a");
}

export function addDaysISO(value: string | Date, days: number): string {
  return format(addDays(toDate(value), days), DATE_FMT);
}

/** Grid of days covering the full weeks of the given month. */
export function monthGrid(monthDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function combineDateTime(date: string, time: string, _timezone?: string): string {
  // Stored as a local wall-clock instant; the scheduler resolves the real
  // instant using the workspace timezone when a publishing worker runs.
  const safeTime = /^\d{2}:\d{2}$/.test(time) ? time : '09:00';
  return new Date(`${date}T${safeTime}:00`).toISOString();
}

export function greetingFor(date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export { isSameDay, isSameMonth, startOfMonth, format };
