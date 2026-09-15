import { AnalyticsQuery, AnalyticsPeriod } from '@kenenisa-os/shared';

export interface DateRange {
  from: Date;
  to: Date;
  fromDateStr: string;
  toDateStr: string;
  period: AnalyticsPeriod;
}

/**
 * Safely calculates percentage (part / total * 100).
 * Returns null if total is zero or invalid.
 */
export function calculatePercentage(part: number, total: number): number | null {
  if (!total || total <= 0) {
    return null;
  }
  const pct = (part / total) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Resolves DateRange based on query parameters (from, to, period).
 */
export function resolveDateRange(query: AnalyticsQuery): DateRange {
  const now = new Date();
  
  if (query.from && query.to) {
    const fromDate = new Date(`${query.from}T00:00:00.000Z`);
    const toDate = new Date(`${query.to}T23:59:59.999Z`);
    return {
      from: fromDate,
      to: toDate,
      fromDateStr: query.from,
      toDateStr: query.to,
      period: query.period || 'custom',
    };
  }

  const period = query.period || 'month';
  const to = new Date(now);
  const from = new Date(now);

  switch (period) {
    case 'day':
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      break;
    case 'week':
      from.setUTCDate(from.getUTCDate() - 7);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      break;
    case 'month':
      from.setUTCDate(from.getUTCDate() - 30);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      break;
    case 'quarter':
      from.setUTCDate(from.getUTCDate() - 90);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      break;
    default:
      from.setUTCDate(from.getUTCDate() - 30);
      from.setUTCHours(0, 0, 0, 0);
      to.setUTCHours(23, 59, 59, 999);
      break;
  }

  const fromDateStr = from.toISOString().split('T')[0];
  const toDateStr = to.toISOString().split('T')[0];

  return {
    from,
    to,
    fromDateStr,
    toDateStr,
    period,
  };
}

/**
 * Generates array of YYYY-MM-DD date strings between from and to.
 */
export function generateDateSeries(fromStr: string, toStr: string): string[] {
  const dates: string[] = [];
  const curr = new Date(`${fromStr}T00:00:00.000Z`);
  const end = new Date(`${toStr}T00:00:00.000Z`);

  while (curr <= end) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return dates;
}
