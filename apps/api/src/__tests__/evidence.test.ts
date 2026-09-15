import { describe, it, expect } from 'vitest';
import { EvidenceService } from '../domain/evidence/evidence.service.js';
import { createEvidenceSchema, evidenceQuerySchema } from '@kenenisa-os/shared';

describe('Evidence Engine Unit Test Suite', () => {
  const service = new EvidenceService();

  it('validates create evidence schema correctly', () => {
    const valid = createEvidenceSchema.parse({
      title: 'KENENISA OS Planning Engine Pull Request',
      description: 'Implemented capacity calculation and conflict detection.',
      type: 'PROJECT',
      url: 'https://github.com/kenenisabeyan/kenenisa-os/pull/7',
      date: '2026-09-16',
    });
    expect(valid.title).toBe('KENENISA OS Planning Engine Pull Request');
    expect(valid.type).toBe('PROJECT');
  });

  it('rejects invalid URL in evidence input', () => {
    expect(() =>
      createEvidenceSchema.parse({
        title: 'Invalid URL Evidence',
        url: 'not-a-url',
      }),
    ).toThrow();
  });

  it('parses evidence query parameters', () => {
    const query = evidenceQuerySchema.parse({
      page: '2',
      pageSize: '10',
      type: 'GITHUB_REPOSITORY',
      search: 'engine',
    });
    expect(query.page).toBe(2);
    expect(query.pageSize).toBe(10);
    expect(query.type).toBe('GITHUB_REPOSITORY');
  });

  it('handles evidence service instance methods', () => {
    expect(typeof service.listEvidence).toBe('function');
    expect(typeof service.createEvidence).toBe('function');
    expect(typeof service.getEvidenceById).toBe('function');
    expect(typeof service.updateEvidence).toBe('function');
    expect(typeof service.deleteEvidence).toBe('function');
    expect(typeof service.linkTask).toBe('function');
    expect(typeof service.unlinkTask).toBe('function');
  });
});
