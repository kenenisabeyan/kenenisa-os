import { describe, it, expect } from 'vitest';
import { formatDate, formatUptime } from './dateTime.js';

describe('dateTime utilities', () => {
  it('formatDate formats date string correctly', () => {
    const formatted = formatDate('2026-09-15T00:00:00Z');
    expect(formatted).toContain('2026');
  });

  it('formatUptime formats seconds into h m s string', () => {
    expect(formatUptime(3665)).toBe('1h 1m 5s');
  });
});
