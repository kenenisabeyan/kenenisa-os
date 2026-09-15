import { describe, it, expect } from 'vitest';
import { ReviewService } from '../domain/reviews/review.service.js';
import { createWeeklyReviewSchema, updateWeeklyReviewSchema } from '@kenenisa-os/shared';

describe('Weekly Reviews Engine Unit Test Suite', () => {
  const service = new ReviewService();

  it('validates create weekly review input', () => {
    const valid = createWeeklyReviewSchema.parse({
      wins: 'Delivered Step 8 Learning & Skills domain',
      challenges: 'Database container lock required process restart',
      lessons: 'Prisma Client must be regenerated on schema edits',
      nextFocus: 'Implement Evidence and Weekly Review engine',
    });
    expect(valid.wins).toBe('Delivered Step 8 Learning & Skills domain');
    expect(valid.nextFocus).toBe('Implement Evidence and Weekly Review engine');
  });

  it('validates update review status transition', () => {
    const valid = updateWeeklyReviewSchema.parse({
      status: 'COMPLETED',
      notes: 'Weekly goals fully met',
    });
    expect(valid.status).toBe('COMPLETED');
  });

  it('handles review service methods', () => {
    expect(typeof service.listWeeklyReviews).toBe('function');
    expect(typeof service.getWeeklyReviewById).toBe('function');
    expect(typeof service.getWeeklyReviewContext).toBe('function');
    expect(typeof service.createWeeklyReview).toBe('function');
    expect(typeof service.updateWeeklyReview).toBe('function');
    expect(typeof service.completeWeeklyReview).toBe('function');
    expect(typeof service.reopenWeeklyReview).toBe('function');
  });
});
