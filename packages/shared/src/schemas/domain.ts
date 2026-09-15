import { z } from 'zod';

// ── Common Enums ─────────────────────────────────────────────────────────────

export const workstreamStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']);
export const goalStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'ACHIEVED', 'CANCELLED']);
export const projectStatusSchema = z.enum([
  'PLANNED',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED',
]);
export const milestoneStatusSchema = z.enum(['UPCOMING', 'IN_PROGRESS', 'REACHED', 'DELAYED']);
export const taskPrioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export const taskStatusSchema = z.enum([
  'BACKLOG',
  'READY',
  'IN_PROGRESS',
  'BLOCKED',
  'REVIEW',
  'DONE',
  'CANCELLED',
]);
export const taskDependencyTypeSchema = z.enum(['BLOCKS', 'BLOCKED_BY']);

// ── Workstream Schemas ───────────────────────────────────────────────────────

export const createWorkstreamSchema = z.object({
  name: z.string().trim().min(1, 'Workstream name is required').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  status: workstreamStatusSchema.default('ACTIVE'),
  priorityWeight: z.number().int().min(1).max(100).default(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateWorkstreamSchema = createWorkstreamSchema.partial();

export const workstreamQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  status: workstreamStatusSchema.optional(),
  sortBy: z.enum(['sortOrder', 'name', 'priorityWeight', 'createdAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// ── Goal Schemas ─────────────────────────────────────────────────────────────

const goalBaseObject = z.object({
  workstreamId: z.string().uuid('Invalid workstream ID'),
  title: z.string().trim().min(1, 'Goal title is required').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: goalStatusSchema.default('PLANNED'),
  priority: taskPrioritySchema.default('P1'),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
});

const validateDateRange = (data: { startDate?: string | null; targetDate?: string | null }) => {
  if (data.startDate && data.targetDate) {
    return new Date(data.targetDate) >= new Date(data.startDate);
  }
  return true;
};

export const createGoalSchema = goalBaseObject.refine(validateDateRange, {
  message: 'Target date must be on or after start date',
  path: ['targetDate'],
});

export const updateGoalSchema = goalBaseObject.partial().refine(validateDateRange, {
  message: 'Target date must be on or after start date',
  path: ['targetDate'],
});

export const goalQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  workstreamId: z.string().uuid().optional(),
  status: goalStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['createdAt', 'targetDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ── Project Schemas ──────────────────────────────────────────────────────────

const projectBaseObject = z.object({
  workstreamId: z.string().uuid('Invalid workstream ID'),
  goalId: z.string().uuid('Invalid goal ID').optional().nullable(),
  name: z.string().trim().min(1, 'Project name is required').max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: projectStatusSchema.default('PLANNED'),
  priority: taskPrioritySchema.default('P2'),
  startDate: z.string().datetime().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
});

export const createProjectSchema = projectBaseObject.refine(validateDateRange, {
  message: 'Target date must be on or after start date',
  path: ['targetDate'],
});

export const updateProjectSchema = projectBaseObject.partial().refine(validateDateRange, {
  message: 'Target date must be on or after start date',
  path: ['targetDate'],
});

export const projectQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  workstreamId: z.string().uuid().optional(),
  goalId: z.string().uuid().optional(),
  status: projectStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().optional(),
  archived: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'targetDate', 'priority', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ── Milestone Schemas ────────────────────────────────────────────────────────

export const createMilestoneSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  name: z.string().trim().min(1, 'Milestone name is required').max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  status: milestoneStatusSchema.default('UPCOMING'),
  sortOrder: z.number().int().min(0).default(0),
  targetDate: z.string().datetime().optional().nullable(),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export const milestoneQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: milestoneStatusSchema.optional(),
  search: z.string().trim().optional(),
});

export const reorderMilestonesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid('Invalid milestone ID'),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1, 'At least one milestone item is required to reorder'),
});

// ── Task Schemas ─────────────────────────────────────────────────────────────

const validateTaskDateRange = (data: { startDate?: string | null; dueDate?: string | null }) => {
  if (data.startDate && data.dueDate) {
    return new Date(data.dueDate) >= new Date(data.startDate);
  }
  return true;
};

const taskBaseObject = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  milestoneId: z.string().uuid('Invalid milestone ID').optional().nullable(),
  parentTaskId: z.string().uuid('Invalid parent task ID').optional().nullable(),
  title: z.string().trim().min(1, 'Task title is required').max(250),
  description: z.string().trim().max(3000).optional().nullable(),
  status: taskStatusSchema.default('BACKLOG'),
  priority: taskPrioritySchema.default('P2'),
  estimateMinutes: z.number().int().min(0).max(10080).default(0),
  actualMinutes: z.number().int().min(0).max(10080).default(0),
  startDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const createTaskSchema = taskBaseObject.refine(validateTaskDateRange, {
  message: 'Due date must be on or after start date',
  path: ['dueDate'],
});

export const updateTaskSchema = taskBaseObject.partial().refine(validateTaskDateRange, {
  message: 'Due date must be on or after start date',
  path: ['dueDate'],
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  projectId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().optional(),
  overdue: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  ready: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  blocked: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  completed: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'dueDate',
      'priority',
      'status',
      'sortOrder',
      'title',
      'estimateMinutes',
    ])
    .default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createTaskDependencySchema = z.object({
  blockingTaskId: z.string().uuid('Invalid blocking task ID'),
  dependencyType: taskDependencyTypeSchema.default('BLOCKS'),
});

export const reorderTasksSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid('Invalid task ID'),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1, 'At least one task item is required to reorder'),
});
