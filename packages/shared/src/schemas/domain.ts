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

// ── Dashboard Schemas ────────────────────────────────────────────────────────

export const dashboardQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  timezone: z.string().trim().optional(),
});

// ── Planning & Capacity Schemas ──────────────────────────────────────────────

export const timeBlockStatusSchema = z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'INTERRUPTED']);

export const createDailyPlanSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  mustWinTaskId: z.string().uuid('Invalid task ID').optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  status: z.string().trim().default('active'),
});

export const updateDailyPlanSchema = createDailyPlanSchema.partial().omit({ date: true });

export const dailyPlanQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  timezone: z.string().trim().optional(),
});

export const createTimeBlockSchema = z.object({
  dailyPlanId: z.string().uuid('Invalid daily plan ID').optional().nullable(),
  taskId: z.string().uuid('Invalid task ID').optional().nullable(),
  title: z.string().trim().min(1, 'Time block title is required').max(200),
  startAt: z.string().datetime('startAt must be a valid ISO datetime'),
  endAt: z.string().datetime('endAt must be a valid ISO datetime'),
  status: timeBlockStatusSchema.default('PLANNED'),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateTimeBlockSchema = createTimeBlockSchema.partial();

export const timeBlockQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  taskId: z.string().uuid().optional(),
  dailyPlanId: z.string().uuid().optional(),
  status: timeBlockStatusSchema.optional(),
});

export const createWeeklyPlanSchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start must be formatted YYYY-MM-DD'),
  theme: z.string().trim().max(300).optional().nullable(),
  notes: z.string().trim().max(3000).optional().nullable(),
  status: z.string().trim().default('active'),
});

export const updateWeeklyPlanSchema = createWeeklyPlanSchema.partial().omit({ weekStart: true });

export const weeklyPlanQuerySchema = z.object({
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start must be formatted YYYY-MM-DD')
    .optional(),
  timezone: z.string().trim().optional(),
});

export const capacityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  weekStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Week start must be formatted YYYY-MM-DD')
    .optional(),
  timezone: z.string().trim().optional(),
});

// ── Learning & Skills Intelligence Schemas ───────────────────────────────────

export const learningItemTypeSchema = z.enum([
  'COURSE',
  'BOOK',
  'TUTORIAL',
  'DOCUMENTATION',
  'LECTURE',
  'PROJECT',
  'PRACTICE',
  'ARTICLE',
  'OTHER',
]);

export const learningItemStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'PAUSED',
  'CANCELLED',
]);

export const skillLevelSchema = z.enum([
  'BEGINNER',
  'ELEMENTARY',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
]);

export const skillStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'MASTERED', 'ARCHIVED']);

export const skillRelevanceSchema = z.enum(['PRIMARY', 'SECONDARY']);

export const createSkillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  currentLevel: skillLevelSchema.default('BEGINNER'),
  targetLevel: skillLevelSchema.default('ADVANCED'),
  status: skillStatusSchema.default('ACTIVE'),
});

export const updateSkillSchema = createSkillSchema.partial().omit({ slug: true });

export const skillQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: skillStatusSchema.optional(),
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const createLearningItemSchema = z.object({
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  title: z.string().trim().min(1, 'Learning item title is required').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  type: learningItemTypeSchema.default('COURSE'),
  status: learningItemStatusSchema.default('NOT_STARTED'),
  source: z.string().trim().max(200).optional().nullable(),
  url: z.string().trim().url('Invalid URL').optional().nullable().or(z.literal('')),
  estimatedMinutes: z.coerce.number().int().min(0).default(0),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be formatted YYYY-MM-DD')
    .optional()
    .nullable(),
});

export const updateLearningItemSchema = createLearningItemSchema.partial().extend({
  progressPercent: z.coerce.number().int().min(0).max(100).optional(),
});

export const learningItemQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: learningItemStatusSchema.optional(),
  type: learningItemTypeSchema.optional(),
  projectId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export const recordLearningActivitySchema = z.object({
  minutes: z.coerce.number().int().positive('Minutes must be greater than 0'),
  notes: z.string().trim().max(1000).optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
});

export const linkLearningSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
  relevance: skillRelevanceSchema.default('PRIMARY'),
});

// ── Evidence & Weekly Review Schemas ──────────────────────────────────────────

export const evidenceTypeSchema = z.enum([
  'GITHUB_REPOSITORY',
  'GIT_COMMIT',
  'DEPLOYMENT',
  'PROJECT',
  'DOCUMENT',
  'SCREENSHOT',
  'VIDEO',
  'CERTIFICATE',
  'ASSIGNMENT',
  'EXAM_RESULT',
  'PRESENTATION',
  'ARTICLE',
  'CLIENT_DELIVERY',
  'PROTOTYPE',
  'RESEARCH_RESULT',
  'OTHER',
]);

export const reviewStatusSchema = z.enum(['DRAFT', 'COMPLETED']);

export const createEvidenceSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  type: evidenceTypeSchema.default('PROJECT'),
  url: z.string().trim().url('Invalid URL').optional().nullable().or(z.literal('')),
  externalReference: z.string().trim().max(500).optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD')
    .optional(),
  taskId: z.string().uuid('Invalid task ID').optional().nullable(),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  learningItemId: z.string().uuid('Invalid learning item ID').optional().nullable(),
  skillId: z.string().uuid('Invalid skill ID').optional().nullable(),
});

export const updateEvidenceSchema = createEvidenceSchema.partial().omit({
  taskId: true,
  projectId: true,
  learningItemId: true,
  skillId: true,
});

export const evidenceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  type: evidenceTypeSchema.optional(),
  search: z.string().trim().optional(),
  projectId: z.string().uuid().optional(),
  taskId: z.string().uuid().optional(),
  learningItemId: z.string().uuid().optional(),
  skillId: z.string().uuid().optional(),
});

export const linkEvidenceTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export const linkEvidenceProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const linkEvidenceLearningSchema = z.object({
  learningItemId: z.string().uuid('Invalid learning item ID'),
});

export const linkEvidenceSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
});

export const createWeeklyReviewSchema = z.object({
  weeklyPlanId: z.string().uuid('Invalid weekly plan ID').optional().nullable(),
  wins: z.string().trim().max(4000).optional().nullable(),
  challenges: z.string().trim().max(4000).optional().nullable(),
  lessons: z.string().trim().max(4000).optional().nullable(),
  nextFocus: z.string().trim().max(4000).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

export const updateWeeklyReviewSchema = createWeeklyReviewSchema.partial().extend({
  status: reviewStatusSchema.optional(),
});

export const weeklyReviewQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: reviewStatusSchema.optional(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// ── Analytics Schemas ────────────────────────────────────────────────────────

export const analyticsPeriodSchema = z.enum(['day', 'week', 'month', 'quarter', 'custom']);
export const analyticsGranularitySchema = z.enum(['day', 'week', 'month']);

export const analyticsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format').optional(),
  period: analyticsPeriodSchema.optional().default('month'),
  granularity: analyticsGranularitySchema.optional().default('day'),
});

// ── Opportunities Schemas ────────────────────────────────────────────────────

export const opportunityTypeSchema = z.enum([
  'FREELANCE',
  'INTERNSHIP',
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'CLIENT',
  'RESEARCH',
  'COLLABORATION',
  'ENTREPRENEURIAL',
  'COMPETITION',
  'SCHOLARSHIP',
  'EVENT',
  'OTHER',
]);

export const opportunityStatusSchema = z.enum([
  'DISCOVERED',
  'EVALUATING',
  'PREPARING',
  'APPLIED',
  'IN_DISCUSSION',
  'INTERVIEW',
  'OFFERED',
  'ACCEPTED',
  'ACTIVE',
  'COMPLETED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED',
  'ARCHIVED',
]);

export const opportunitySourceSchema = z.enum([
  'DIRECT_CONTACT',
  'COMPANY_WEBSITE',
  'LINKEDIN',
  'UPWORK',
  'REFERRAL',
  'UNIVERSITY',
  'YOMTECH',
  'PERSONAL_NETWORK',
  'EMAIL',
  'EVENT',
  'OTHER',
]);

export const opportunityActivityTypeSchema = z.enum([
  'NOTE',
  'CONTACT',
  'APPLICATION_SUBMITTED',
  'INTERVIEW',
  'FOLLOW_UP',
  'OFFER',
  'STATUS_CHANGE',
  'OTHER',
]);

export const createOpportunitySchema = z.object({
  title: z.string().trim().min(1, 'Opportunity title is required').max(200),
  description: z.string().trim().max(4000).optional().nullable(),
  type: opportunityTypeSchema.default('FULL_TIME'),
  status: opportunityStatusSchema.default('DISCOVERED'),
  priority: taskPrioritySchema.default('P2'),
  organizationName: z.string().trim().max(200).optional().nullable(),
  contactName: z.string().trim().max(100).optional().nullable(),
  contactEmail: z.string().trim().email('Invalid email address').optional().nullable().or(z.literal('')),
  source: opportunitySourceSchema.default('OTHER'),
  sourceUrl: z.string().trim().url('Invalid URL').optional().nullable().or(z.literal('')),
  location: z.string().trim().max(200).optional().nullable(),
  remote: z.boolean().default(false),
  estimatedValue: z.number().positive().optional().nullable(),
  currency: z.string().trim().length(3).default('USD'),
  startDate: z.string().datetime().optional().nullable().or(z.literal('')),
  deadline: z.string().datetime().optional().nullable().or(z.literal('')),
  followUpDate: z.string().datetime().optional().nullable().or(z.literal('')),
  notes: z.string().trim().max(4000).optional().nullable(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const opportunityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  status: opportunityStatusSchema.optional(),
  type: opportunityTypeSchema.optional(),
  priority: taskPrioritySchema.optional(),
  source: opportunitySourceSchema.optional(),
  remote: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
  deadlineFrom: z.string().optional(),
  deadlineTo: z.string().optional(),
});

export const linkOpportunitySkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
  relevance: z.enum(['PRIMARY', 'SECONDARY']).default('PRIMARY'),
});

export const linkOpportunityProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
});

export const linkOpportunityEvidenceSchema = z.object({
  evidenceId: z.string().uuid('Invalid evidence ID'),
});

export const linkOpportunityTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export const createOpportunityActivitySchema = z.object({
  type: opportunityActivityTypeSchema.default('NOTE'),
  title: z.string().trim().min(1, 'Activity title is required').max(200),
  description: z.string().trim().max(4000).optional().nullable(),
  occurredAt: z.string().datetime().optional(),
});

// ── Intelligence Core Schemas ────────────────────────────────────────────────

export const memoryCategorySchema = z.enum([
  'PREFERENCE',
  'WORKFLOW',
  'GOAL_CONTEXT',
  'PROJECT_CONTEXT',
  'LEARNING_PREFERENCE',
  'COMMUNICATION_PREFERENCE',
  'OTHER',
]);

export const intelligenceChatSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID').optional(),
  message: z.string().trim().min(1, 'Message cannot be empty').max(4000),
});

export const createConversationSchema = z.object({
  title: z.string().trim().max(200).optional().default('New Conversation'),
});

export const updateConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  archived: z.boolean().optional(),
});

export const createUserMemorySchema = z.object({
  key: z.string().trim().min(1, 'Memory key is required').max(100),
  value: z.string().trim().min(1, 'Memory value is required').max(2000),
  category: memoryCategorySchema.default('OTHER'),
  source: z.string().trim().max(100).default('USER_CONFIRMED'),
  confidence: z.number().min(0).max(1).default(1.0),
});

export const updateUserMemorySchema = z.object({
  value: z.string().trim().min(1).max(2000).optional(),
  category: memoryCategorySchema.optional(),
  archived: z.boolean().optional(),
});

export const confirmActionSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  confirm: z.boolean(),
  overrides: z.record(z.unknown()).optional(),
});






