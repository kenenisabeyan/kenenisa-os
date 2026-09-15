import { describe, it, expect } from 'vitest';
import { OpportunityService } from '../domain/opportunities/opportunity.service.js';
import {
  createOpportunitySchema,
  updateOpportunitySchema,
  opportunityQuerySchema,
  linkOpportunitySkillSchema,
  linkOpportunityProjectSchema,
  linkOpportunityEvidenceSchema,
  linkOpportunityTaskSchema,
  createOpportunityActivitySchema,
} from '@kenenisa-os/shared';

describe('Opportunity & Career Execution Engine Unit Test Suite', () => {
  const service = new OpportunityService();

  it('validates create opportunity schema correctly', () => {
    const input = createOpportunitySchema.parse({
      title: 'Senior Full Stack Engineer Role',
      description: 'Engineering role focusing on React and Node.js microservices',
      type: 'FULL_TIME',
      status: 'DISCOVERED',
      priority: 'P1',
      organizationName: 'TechCorp International',
      contactName: 'Jane Smith',
      contactEmail: 'jane@techcorp.com',
      source: 'LINKEDIN',
      sourceUrl: 'https://linkedin.com/jobs/view/123456',
      location: 'Remote',
      remote: true,
      estimatedValue: 120000,
      currency: 'USD',
      deadline: '2026-10-15T00:00:00.000Z',
      followUpDate: '2026-09-20T00:00:00.000Z',
    });

    expect(input.title).toBe('Senior Full Stack Engineer Role');
    expect(input.type).toBe('FULL_TIME');
    expect(input.priority).toBe('P1');
    expect(input.remote).toBe(true);
    expect(input.estimatedValue).toBe(120000);
  });

  it('rejects invalid email or URLs in opportunity input', () => {
    expect(() =>
      createOpportunitySchema.parse({
        title: 'Bad Opportunity',
        contactEmail: 'invalid-email',
      }),
    ).toThrow();

    expect(() =>
      createOpportunitySchema.parse({
        title: 'Bad URL',
        sourceUrl: 'invalid-url',
      }),
    ).toThrow();
  });

  it('validates update opportunity schema with partial fields', () => {
    const input = updateOpportunitySchema.parse({
      status: 'INTERVIEW',
      notes: 'Passed initial screening interview on Tuesday.',
      priority: 'P0',
    });

    expect(input.status).toBe('INTERVIEW');
    expect(input.notes).toBe('Passed initial screening interview on Tuesday.');
    expect(input.priority).toBe('P0');
  });

  it('parses opportunity query filters and pagination', () => {
    const query = opportunityQuerySchema.parse({
      page: '1',
      pageSize: '20',
      status: 'APPLIED',
      type: 'FREELANCE',
      search: 'Backend',
    });

    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(20);
    expect(query.status).toBe('APPLIED');
    expect(query.type).toBe('FREELANCE');
    expect(query.search).toBe('Backend');
  });

  it('validates link schemas for skills, projects, evidence, tasks, and activities', () => {
    const skillLink = linkOpportunitySkillSchema.parse({
      skillId: '11111111-1111-4111-a111-111111111111',
      relevance: 'PRIMARY',
    });
    expect(skillLink.relevance).toBe('PRIMARY');

    const projectLink = linkOpportunityProjectSchema.parse({
      projectId: '22222222-2222-4222-a222-222222222222',
    });
    expect(projectLink.projectId).toBe('22222222-2222-4222-a222-222222222222');

    const evidenceLink = linkOpportunityEvidenceSchema.parse({
      evidenceId: '33333333-3333-4333-a333-333333333333',
    });
    expect(evidenceLink.evidenceId).toBe('33333333-3333-4333-a333-333333333333');

    const taskLink = linkOpportunityTaskSchema.parse({
      taskId: '44444444-4444-4444-a444-444444444444',
    });
    expect(taskLink.taskId).toBe('44444444-4444-4444-a444-444444444444');

    const activity = createOpportunityActivitySchema.parse({
      type: 'INTERVIEW',
      title: 'Interview Completed',
      description: 'Completed Technical System Design Interview with Lead Architect.',
      occurredAt: '2026-09-16T10:00:00.000Z',
    });
    expect(activity.type).toBe('INTERVIEW');
  });

  it('verifies service contract method definitions', () => {
    expect(typeof service.listOpportunities).toBe('function');
    expect(typeof service.createOpportunity).toBe('function');
    expect(typeof service.getOpportunityById).toBe('function');
    expect(typeof service.updateOpportunity).toBe('function');
    expect(typeof service.transitionStatus).toBe('function');
    expect(typeof service.linkSkill).toBe('function');
    expect(typeof service.unlinkSkill).toBe('function');
    expect(typeof service.linkProject).toBe('function');
    expect(typeof service.unlinkProject).toBe('function');
    expect(typeof service.linkEvidence).toBe('function');
    expect(typeof service.unlinkEvidence).toBe('function');
    expect(typeof service.linkTask).toBe('function');
    expect(typeof service.unlinkTask).toBe('function');
    expect(typeof service.createActivity).toBe('function');
    expect(typeof service.getFollowUps).toBe('function');
    expect(typeof service.getDeadlines).toBe('function');
    expect(typeof service.getOpportunityAnalytics).toBe('function');
  });
});
