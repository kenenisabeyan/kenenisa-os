import { PrismaClient, TaskPriority, TaskStatus, UserRole, WorkstreamStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const CORE_WORKSTREAMS = [
  {
    name: 'ASTU / Graduation',
    slug: 'astu-graduation',
    description: '5th-year academic coursework, assignments, exams & final projects',
    priorityWeight: 10,
    sortOrder: 1,
  },
  {
    name: 'Full-Stack Engineering',
    slug: 'fullstack-engineering',
    description: 'Production systems development, web architecture & engineering mastery',
    priorityWeight: 9,
    sortOrder: 2,
  },
  {
    name: 'AI Engineering',
    slug: 'ai-engineering',
    description: 'LLM fine-tuning, RAG pipelines, autonomous agents & ML research',
    priorityWeight: 8,
    sortOrder: 3,
  },
  {
    name: 'EDOT',
    slug: 'edot',
    description: 'SaaS product development, digital education tools & platform scaling',
    priorityWeight: 7,
    sortOrder: 4,
  },
  {
    name: 'Management',
    slug: 'management',
    description: 'Project management, agile frameworks & engineering leadership studies',
    priorityWeight: 6,
    sortOrder: 5,
  },
  {
    name: 'Freelancing',
    slug: 'freelancing',
    description: 'Client consulting, contract delivery & commercial software projects',
    priorityWeight: 5,
    sortOrder: 6,
  },
  {
    name: 'Personal Brand',
    slug: 'personal-brand',
    description: 'Technical writing, open source impact & engineering presence',
    priorityWeight: 4,
    sortOrder: 7,
  },
];

async function main() {
  console.info('🌱 Starting KENENISA OS database seed...');

  const defaultPasswordHash = await argon2.hash('KenenisaOS#2026!SecureOwnerPass', {
    type: argon2.argon2id,
  });

  // 1. Create or upsert primary user
  const user = await prisma.user.upsert({
    where: { email: 'kenenisa@kenenisa-os.internal' },
    update: {
      passwordHash: defaultPasswordHash,
      role: UserRole.OWNER,
    },
    create: {
      email: 'kenenisa@kenenisa-os.internal',
      passwordHash: defaultPasswordHash,
      firstName: 'Kenenisa',
      lastName: 'Beyan',
      displayName: 'Kenenisa Beyan',
      role: UserRole.OWNER,
      isActive: true,
    },
  });
  console.info(`👤 Owner user ready: ${user.email} (${user.id})`);

  // 2. Create or upsert UserSettings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      timezone: 'Africa/Addis_Ababa',
      weekStartsOn: 1,
      dailyWorkCapacityMinutes: 480,
      weeklyWorkCapacityMinutes: 2400,
      defaultTaskPriority: TaskPriority.P2,
      defaultProjectView: 'board',
      theme: 'dark',
    },
  });
  console.info('⚙️ User settings initialized');

  // 3. Create or upsert 7 Core Workstreams
  const createdWorkstreams = [];
  for (const ws of CORE_WORKSTREAMS) {
    const item = await prisma.workstream.upsert({
      where: {
        userId_slug: {
          userId: user.id,
          slug: ws.slug,
        },
      },
      update: {
        name: ws.name,
        description: ws.description,
        priorityWeight: ws.priorityWeight,
        sortOrder: ws.sortOrder,
      },
      create: {
        userId: user.id,
        name: ws.name,
        slug: ws.slug,
        description: ws.description,
        status: WorkstreamStatus.ACTIVE,
        priorityWeight: ws.priorityWeight,
        sortOrder: ws.sortOrder,
      },
    });
    createdWorkstreams.push(item);
  }
  console.info(`📌 Initialized ${createdWorkstreams.length} core workstreams`);

  // 4. Create sample verification Goal, Project, Milestone, and Task under Full-Stack Engineering
  const fullstackWs = createdWorkstreams.find((w) => w.slug === 'fullstack-engineering');
  if (fullstackWs) {
    const goal = await prisma.goal.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        userId: user.id,
        workstreamId: fullstackWs.id,
        title: 'Master Advanced Web Application Architecture',
        description: 'Build enterprise monorepo infrastructure with PostgreSQL & React',
        priority: TaskPriority.P1,
      },
    });

    const project = await prisma.project.upsert({
      where: {
        userId_slug: {
          userId: user.id,
          slug: 'kenenisa-os-core',
        },
      },
      update: {},
      create: {
        userId: user.id,
        workstreamId: fullstackWs.id,
        goalId: goal.id,
        name: 'KENENISA OS Core System',
        slug: 'kenenisa-os-core',
        description: 'Personal 5th-year Engineering & Career Operating System implementation',
        priority: TaskPriority.P0,
      },
    });

    const milestone = await prisma.milestone.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        userId: user.id,
        projectId: project.id,
        name: 'Database Foundation Baseline',
        description: 'PostgreSQL schema design and Prisma ORM integration',
        sortOrder: 1,
      },
    });

    await prisma.task.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        userId: user.id,
        projectId: project.id,
        milestoneId: milestone.id,
        title: 'Verify Prisma PostgreSQL schema and migrations',
        description: 'Ensure referential integrity, indexes, and seed validation',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.P0,
        estimateMinutes: 120,
      },
    });
    console.info('🚀 Verification goal, project, milestone, and task created');
  }

  console.info('✅ KENENISA OS database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
