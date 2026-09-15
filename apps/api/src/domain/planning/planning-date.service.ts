export interface DateRangeUtc {
  startUtc: Date;
  endUtc: Date;
}

export class PlanningDateService {
  /**
   * Parse a YYYY-MM-DD date string or default to current date.
   * Returns UTC midnight start and end of that calendar date.
   */
  getDailyBounds(dateStr?: string): { dateStr: string; startUtc: Date; endUtc: Date } {
    let targetDate: Date;
    if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      targetDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      const now = new Date();
      targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const year = targetDate.getUTCFullYear();
    const month = targetDate.getUTCMonth();
    const day = targetDate.getUTCDate();

    const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const startUtc = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const endUtc = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    return { dateStr: formattedDateStr, startUtc, endUtc };
  }

  /**
   * Compute weekStart and weekEnd dates respecting weekStartsOn preference (1 = Monday, 0 = Sunday).
   */
  getWeeklyBounds(
    weekStartStr?: string,
    weekStartsOn = 1,
  ): { weekStartStr: string; weekEndStr: string; startUtc: Date; endUtc: Date } {
    let baseDate: Date;
    if (weekStartStr && /^\d{4}-\d{2}-\d{2}$/.test(weekStartStr)) {
      const [year, month, day] = weekStartStr.split('-').map(Number);
      baseDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      const now = new Date();
      baseDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    }

    const dayOfWeek = baseDate.getUTCDay(); // 0 = Sunday, 1 = Monday
    const diffToWeekStart = (dayOfWeek - weekStartsOn + 7) % 7;

    const startUtc = new Date(baseDate);
    startUtc.setUTCDate(startUtc.getUTCDate() - diffToWeekStart);
    startUtc.setUTCHours(0, 0, 0, 0);

    const endUtc = new Date(startUtc);
    endUtc.setUTCDate(endUtc.getUTCDate() + 6);
    endUtc.setUTCHours(23, 59, 59, 999);

    const format = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

    return {
      weekStartStr: format(startUtc),
      weekEndStr: format(endUtc),
      startUtc,
      endUtc,
    };
  }
}
