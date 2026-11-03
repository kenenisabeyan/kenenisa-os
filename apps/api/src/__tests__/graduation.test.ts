import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';
import { createSession } from '../domain/auth/session.service.js';

const app = createApp();

describe('Graduation Command Center & Academics Test Suite', { timeout: 120000 }, () => {
  let bearerToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Locate owner user or create test user
    let user = await prisma.user.findFirst({
      where: { email: 'beyankenenisa@gmail.com' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test_grad_user@kenenisa-os.local',
          passwordHash: 'hash',
          firstName: 'Kenenisa',
          lastName: 'Beyan',
          displayName: 'Kenenisa Beyan',
          role: 'OWNER',
        },
      });
    }

    testUserId = user.id;

    // Create session token
    const { rawToken } = await createSession({ userId: testUserId });
    bearerToken = `Bearer ${rawToken}`;
  });

  it('POST /api/v1/graduation/initialize idempotently provisions graduation workspace', async () => {
    const res = await request(app)
      .post('/api/v1/graduation/initialize')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('initialized successfully');
  });

  it('GET /api/v1/graduation/overview returns verified graduation metrics and calculation basis', async () => {
    const res = await request(app)
      .get('/api/v1/graduation/overview')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const overview = res.body.data.overview;

    expect(overview.university).toBe('Adama Science and Technology University (ASTU)');
    expect(overview.academicYear).toBe('2026/2027');
    expect(overview.level).toBe('Fifth Year');
    expect(overview.activeProjects).toHaveLength(2);
    expect(overview.progressBreakdown.academicRequirements.basis).toBeDefined();
    expect(overview.progressBreakdown.individualProject.basis).toBeDefined();
    expect(overview.progressBreakdown.groupProject.basis).toBeDefined();
    expect(overview.progressBreakdown.finalDocumentation.basis).toBeDefined();
    expect(overview.progressBreakdown.defensePreparation.basis).toBeDefined();
    expect(overview.todayExecution.availableCapacityMinutes).toBeGreaterThanOrEqual(0);
  });

  it('PATCH /api/v1/graduation/settings updates configurable graduation target date', async () => {
    const targetDate = '2027-07-15';
    const res = await request(app)
      .patch('/api/v1/graduation/settings')
      .set('Authorization', bearerToken)
      .send({ graduationTargetDate: targetDate });

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get('/api/v1/graduation/overview')
      .set('Authorization', bearerToken);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.overview.graduationTargetDate).toBe(targetDate);
  });

  it('GET /api/v1/academics/courses returns the 7 configured ASTU courses', async () => {
    const res = await request(app)
      .get('/api/v1/academics/courses')
      .set('Authorization', bearerToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const courses = res.body.data.courses;
    expect(courses.length).toBeGreaterThanOrEqual(7);

    const titles = courses.map((c: any) => c.title);
    expect(titles).toContain('Entrepreneurship and Business Development');
    expect(titles).toContain('Distributed Systems');
    expect(titles).toContain('Numerical Analysis I');
  });

  it('PATCH /api/v1/academics/courses/:id updates status and understanding level', async () => {
    const listRes = await request(app)
      .get('/api/v1/academics/courses')
      .set('Authorization', bearerToken);

    const firstCourse = listRes.body.data.courses[0];
    expect(firstCourse).toBeDefined();

    const patchRes = await request(app)
      .patch(`/api/v1/academics/courses/${firstCourse.id}`)
      .set('Authorization', bearerToken)
      .send({
        academicStatus: 'IN_PROGRESS',
        currentUnderstanding: 'PROFICIENT',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.course.academicStatus).toBe('IN_PROGRESS');
    expect(patchRes.body.data.course.currentUnderstanding).toBe('PROFICIENT');
  });
});
