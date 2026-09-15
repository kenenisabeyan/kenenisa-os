import { describe, it, expect, vi } from 'vitest';
import {
  fetchOpportunities,
  fetchOpportunityById,
  createOpportunity,
  transitionOpportunityStatus,
  linkOpportunitySkill,
  fetchOpportunityAnalytics,
} from '../opportunities/api.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/analytics/opportunities')) {
      return Promise.resolve({
        totalOpportunities: 5,
        activeOpportunities: 3,
        appliedOpportunities: 1,
        interviews: 1,
        offers: 0,
        accepted: 0,
        winRate: 0,
        followUpsDue: 2,
        followUpsOverdue: 0,
        typeBreakdown: { FULL_TIME: 3, FREELANCE: 2 },
        statusBreakdown: { DISCOVERED: 2, APPLIED: 1, INTERVIEW: 1, ACCEPTED: 1 },
      });
    }

    if (url.includes('/opportunities/op-1/interview') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'op-1',
        title: 'Senior Engineer',
        status: 'INTERVIEW',
      });
    }

    if (url.includes('/opportunities/op-1/skills') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'op-1',
        skills: [{ id: 'link-1', opportunityId: 'op-1', skillId: 'skill-1', relevanceScore: 8 }],
      });
    }

    if (url.includes('/opportunities/op-1')) {
      return Promise.resolve({
        id: 'op-1',
        userId: 'user-1',
        title: 'Senior Engineer',
        type: 'FULL_TIME',
        status: 'APPLIED',
        priority: 'P1',
        organizationName: 'Acme Corp',
        skills: [],
        projects: [],
        evidence: [],
        tasks: [],
        activities: [],
      });
    }

    if (url.includes('/opportunities') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'op-2',
        title: 'Freelance API Build',
        type: 'FREELANCE',
        status: 'DISCOVERED',
      });
    }

    if (url.includes('/opportunities') && (!init || init.method === 'GET')) {
      return Promise.resolve([
        {
          id: 'op-1',
          userId: 'user-1',
          title: 'Senior Engineer',
          type: 'FULL_TIME',
          status: 'APPLIED',
          priority: 'P1',
        },
      ]);
    }

    return Promise.resolve({});
  }),
}));

describe('Frontend Opportunities API Client', () => {
  it('fetches opportunity list correctly', async () => {
    const list = await fetchOpportunities({ status: 'APPLIED' });
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Senior Engineer');
  });

  it('fetches opportunity detail by id', async () => {
    const detail = await fetchOpportunityById('op-1');
    expect(detail.id).toBe('op-1');
    expect(detail.organizationName).toBe('Acme Corp');
  });

  it('creates opportunity correctly', async () => {
    const created = await createOpportunity({
      title: 'Freelance API Build',
      type: 'FREELANCE',
    });
    expect(created.id).toBe('op-2');
    expect(created.type).toBe('FREELANCE');
  });

  it('transitions opportunity status correctly', async () => {
    const updated = await transitionOpportunityStatus('op-1', 'interview');
    expect(updated.status).toBe('INTERVIEW');
  });

  it('links skill to opportunity correctly', async () => {
    const updated = await linkOpportunitySkill('op-1', 'skill-1', 'PRIMARY');
    expect(updated.skills).toHaveLength(1);
  });

  it('fetches opportunity analytics metrics', async () => {
    const analytics = await fetchOpportunityAnalytics();
    expect(analytics.totalOpportunities).toBe(5);
    expect(analytics.activeOpportunities).toBe(3);
    expect(analytics.followUpsDue).toBe(2);
  });
});
