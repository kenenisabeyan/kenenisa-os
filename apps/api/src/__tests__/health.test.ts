import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import type { HealthResponse, ReadinessResponse, ApiErrorResponse } from '@kenenisa-os/shared';

const app = createApp();

describe('Health Endpoints Integration Tests', () => {
  it('GET /api/v1/health returns healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    const body = res.body as HealthResponse;
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('message', 'KENENISA OS API is healthy');
    expect(body.data).toHaveProperty('status', 'healthy');
    expect(res.headers).toHaveProperty('x-request-id');
  });

  it('GET /api/v1/live returns liveness status', async () => {
    const res = await request(app).get('/api/v1/live');
    const body = res.body as HealthResponse;
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('status', 'healthy');
  });

  it('GET /api/v1/ready returns readiness status with checks', async () => {
    const res = await request(app).get('/api/v1/ready');
    const body = res.body as ReadinessResponse;
    expect(res.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body.data).toHaveProperty('checks');
  });

  it('GET /api/v1/nonexistent returns standard 404 response', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    const body = res.body as ApiErrorResponse;
    expect(res.status).toBe(404);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});
