import { describe, it, expect } from 'vitest';
import { analyticsQuerySchema } from '@kenenisa-os/shared';
import { resolveDateRange, calculatePercentage, generateDateSeries, generateBoundedDateSeries } from '../domain/analytics/analytics.utils.js';
import { AnalyticsService } from '../domain/analytics/analytics.service.js';

describe('Analytics & Personal Operating Intelligence Unit Suite', () => {
  const service = new AnalyticsService();

  it('validates analytics query parameters', () => {
    const parsedDefault = analyticsQuerySchema.parse({});
    expect(parsedDefault.period).toBe('month');
    expect(parsedDefault.granularity).toBe('day');

    const parsedCustom = analyticsQuerySchema.parse({
      from: '2026-09-01',
      to: '2026-09-30',
      period: 'custom',
    });
    expect(parsedCustom.from).toBe('2026-09-01');
    expect(parsedCustom.to).toBe('2026-09-30');
    expect(parsedCustom.period).toBe('custom');
  });

  it('calculates percentages safely with zero denominators', () => {
    expect(calculatePercentage(5, 10)).toBe(50);
    expect(calculatePercentage(1, 3)).toBe(33.3);
    expect(calculatePercentage(0, 10)).toBe(0);
    expect(calculatePercentage(10, 0)).toBeNull();
    expect(calculatePercentage(0, 0)).toBeNull();
  });

  it('resolves date ranges correctly for predefined periods', () => {
    const rangeMonth = resolveDateRange({ period: 'month' });
    expect(rangeMonth.period).toBe('month');
    expect(rangeMonth.fromDateStr).toBeDefined();
    expect(rangeMonth.toDateStr).toBeDefined();

    const rangeCustom = resolveDateRange({ from: '2026-09-01', to: '2026-09-15', period: 'custom' });
    expect(rangeCustom.fromDateStr).toBe('2026-09-01');
    expect(rangeCustom.toDateStr).toBe('2026-09-15');
  });

  it('generates date series between start and end dates', () => {
    const series = generateDateSeries('2026-09-01', '2026-09-05');
    expect(series).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ]);
  });

  it('exposes all required analytics service methods', () => {
    expect(typeof service.getOverview).toBe('function');
    expect(typeof service.getExecutionTrend).toBe('function');
    expect(typeof service.getProjectAnalytics).toBe('function');
    expect(typeof service.getGoalAnalytics).toBe('function');
    expect(typeof service.getWorkstreamAnalytics).toBe('function');
    expect(typeof service.getPlanningAnalytics).toBe('function');
    expect(typeof service.getCapacityAnalytics).toBe('function');
    expect(typeof service.getOverdueAnalytics).toBe('function');
    expect(typeof service.getBlockedAnalytics).toBe('function');
    expect(typeof service.getLearningAnalytics).toBe('function');
    expect(typeof service.getLearningTrend).toBe('function');
    expect(typeof service.getSkillAnalytics).toBe('function');
    expect(typeof service.getEvidenceAnalytics).toBe('function');
    expect(typeof service.getEvidenceTrend).toBe('function');
    expect(typeof service.getReviewAnalytics).toBe('function');
    expect(typeof service.getWeeklyHistory).toBe('function');
  });

  it('OPT-001: parses page, pageSize, limit, and offset pagination parameters in analyticsQuerySchema', () => {
    const parsedPagination = analyticsQuerySchema.parse({
      page: 2,
      pageSize: 25,
      limit: 25,
      offset: 25,
    });
    expect(parsedPagination.page).toBe(2);
    expect(parsedPagination.pageSize).toBe(25);
    expect(parsedPagination.limit).toBe(25);
    expect(parsedPagination.offset).toBe(25);
  });

  it('PE-007: generateBoundedDateSeries caps output at maxPoints for large date ranges', () => {
    // 400-day range should be capped at default 365 points
    const series400 = generateBoundedDateSeries('2025-01-01', '2026-02-05');
    expect(series400.length).toBe(365);
    // The most recent 365 days should be returned (truncated from the start)
    expect(series400[series400.length - 1]).toBe('2026-02-05');

    // Range within limit should be returned in full
    const series30 = generateBoundedDateSeries('2026-09-01', '2026-09-30', 365);
    expect(series30.length).toBe(30);
    expect(series30[0]).toBe('2026-09-01');
    expect(series30[series30.length - 1]).toBe('2026-09-30');

    // Explicit smaller maxPoints cap
    const seriesCapped = generateBoundedDateSeries('2026-09-01', '2026-09-30', 10);
    expect(seriesCapped.length).toBe(10);
    expect(seriesCapped[seriesCapped.length - 1]).toBe('2026-09-30');
  });
});


