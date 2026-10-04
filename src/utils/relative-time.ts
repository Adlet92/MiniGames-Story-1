const MILLISECONDS_PER_MINUTE: number = 60_000;
const MINUTES_PER_HOUR: number = 60;
const HOURS_PER_DAY: number = 24;
const DAYS_PER_WEEK: number = 7;
const DAYS_PER_MONTH_BOUNDARY: number = 28;
const DAYS_PER_YEAR: number = 365;

function pluralize(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural} ago`;
}

export function formatRelativeTime(timestamp: string, now: Date = new Date()): string {
  const createdAt: Date = new Date(timestamp);

  if (Number.isNaN(createdAt.getTime())) {
    return 'just now';
  }

  const elapsedMilliseconds: number = Math.max(0, now.getTime() - createdAt.getTime());
  const elapsedMinutes: number = Math.floor(elapsedMilliseconds / MILLISECONDS_PER_MINUTE);

  if (elapsedMinutes < 1) {
    return 'just now';
  }

  if (elapsedMinutes < MINUTES_PER_HOUR) {
    return pluralize(elapsedMinutes, 'min', 'min');
  }

  const elapsedHours: number = Math.floor(elapsedMinutes / MINUTES_PER_HOUR);

  if (elapsedHours < HOURS_PER_DAY) {
    return pluralize(elapsedHours, 'hour', 'hours');
  }

  const elapsedDays: number = Math.floor(elapsedHours / HOURS_PER_DAY);

  if (elapsedDays < DAYS_PER_WEEK) {
    return pluralize(elapsedDays, 'day', 'days');
  }

  if (elapsedDays < DAYS_PER_MONTH_BOUNDARY) {
    const elapsedWeeks: number = Math.floor(elapsedDays / DAYS_PER_WEEK);
    return pluralize(elapsedWeeks, 'week', 'weeks');
  }

  if (elapsedDays < DAYS_PER_YEAR) {
    const elapsedMonths: number = Math.min(11, Math.max(1, Math.floor(elapsedDays / 30)));
    return pluralize(elapsedMonths, 'month', 'months');
  }

  const elapsedYears: number = Math.floor(elapsedDays / DAYS_PER_YEAR);
  return pluralize(elapsedYears, 'year', 'years');
}
