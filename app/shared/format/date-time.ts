const LOCALE = 'es-PE';
const TIME_ZONE = 'America/Lima';

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeZone: TIME_ZONE,
});

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

export function formatDateTime(date: Date): string {
  return dateTimeFormat.format(date);
}

export function formatTime(date: Date): string {
  return timeFormat.format(date);
}

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function formatCalendarDay(day: string): string {
  return dateFormat.format(new Date(`${day}T12:00:00Z`));
}
