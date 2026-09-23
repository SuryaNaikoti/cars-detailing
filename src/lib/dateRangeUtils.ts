// Shared Date Range Utility for Torque Expert's Workshop OS V3.0
// Supports: Today, Yesterday, This Week, Last Week, Current Month, Previous Month, Last 30 Days, Custom Range

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'current_month'
  | 'previous_month'
  | 'last_30_days'
  | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  label: string;
  startDate: Date;
  endDate: Date;
  customStart?: string;
  customEnd?: string;
}

// Fixed workshop anchor date: 2026-09-21 (Simulation anchor)
export const SYSTEM_NOW = new Date('2026-09-21T19:55:00Z');

export const DATE_RANGE_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: 'Today (21 Sep 2026)' },
  { id: 'yesterday', label: 'Yesterday (20 Sep 2026)' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'current_month', label: 'Current Month (Sep 2026)' },
  { id: 'previous_month', label: 'Previous Month (Aug 2026)' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Range' },
];

export function getDateRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date(SYSTEM_NOW);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  let start: Date;
  let end: Date;

  switch (preset) {
    case 'today': {
      start = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
      break;
    }
    case 'yesterday': {
      start = new Date(Date.UTC(year, month, date - 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, date - 1, 23, 59, 59, 999));
      break;
    }
    case 'this_week': {
      // Monday as start of week
      const dayOfWeek = now.getUTCDay(); // 0 is Sunday, 1 is Monday
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(Date.UTC(year, month, date - diffToMonday, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, date + (7 - diffToMonday), 23, 59, 59, 999));
      break;
    }
    case 'last_week': {
      const dayOfWeek = now.getUTCDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(Date.UTC(year, month, date - diffToMonday - 7, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, date - diffToMonday - 1, 23, 59, 59, 999));
      break;
    }
    case 'current_month': {
      start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      break;
    }
    case 'previous_month': {
      start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      break;
    }
    case 'last_30_days': {
      start = new Date(Date.UTC(year, month, date - 30, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
      break;
    }
    case 'custom': {
      if (customStart) {
        start = new Date(customStart + 'T00:00:00Z');
      } else {
        start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      }
      if (customEnd) {
        end = new Date(customEnd + 'T23:59:59.999Z');
      } else {
        end = new Date(Date.UTC(year, month, date, 23, 59, 59, 999));
      }
      break;
    }
    default: {
      start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    }
  }

  const option = DATE_RANGE_OPTIONS.find((o) => o.id === preset);
  return {
    preset,
    label: option ? option.label : 'Current Month',
    startDate: start,
    endDate: end,
    customStart,
    customEnd,
  };
}

export function getComparisonDateRange(currentRange: DateRange): DateRange {
  // If current month -> previous month
  if (currentRange.preset === 'current_month') {
    return getDateRange('previous_month');
  }
  if (currentRange.preset === 'this_week') {
    return getDateRange('last_week');
  }
  if (currentRange.preset === 'today') {
    return getDateRange('yesterday');
  }

  // Generic shift by duration
  const durationMs = currentRange.endDate.getTime() - currentRange.startDate.getTime();
  const prevEnd = new Date(currentRange.startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    preset: 'custom',
    label: 'Previous Period',
    startDate: prevStart,
    endDate: prevEnd,
  };
}

export function isDateInRange(
  dateValue: string | Date | undefined | null,
  range: DateRange
): boolean {
  if (!dateValue) return false;
  try {
    const d = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(d.getTime())) return false;
    const time = d.getTime();
    return time >= range.startDate.getTime() && time <= range.endDate.getTime();
  } catch {
    return false;
  }
}

export function formatDateRangeDisplay(range: DateRange): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  };
  const startStr = range.startDate.toLocaleDateString('en-GB', options);
  const endStr = range.endDate.toLocaleDateString('en-GB', options);
  return `${startStr} – ${endStr}`;
}
