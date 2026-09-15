/**
 * Shared Domain Types for KENENISA OS
 * Covers Workstreams, Goals, Projects, and Milestones.
 */

export type WorkstreamStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type GoalStatus = 'PLANNED' | 'IN_PROGRESS' | 'ACHIEVED' | 'CANCELLED';
export type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type MilestoneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'REACHED' | 'DELAYED';
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

// ── Workstream Types ─────────────────────────────────────────────────────────

export interface WorkstreamDto {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  status: WorkstreamStatus;
  priorityWeight: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    goals?: number;
    projects?: number;
  };
}

export interface WorkstreamQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: WorkstreamStatus;
  sortBy?: 'sortOrder' | 'name' | 'priorityWeight' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ── Goal Types ───────────────────────────────────────────────────────────────

export interface GoalDto {
  id: string;
  userId: string;
  workstreamId: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  priority: TaskPriority;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workstream?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    projects?: number;
  };
}

export interface GoalQuery {
  page?: number;
  pageSize?: number;
  workstreamId?: string;
  status?: GoalStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: 'createdAt' | 'targetDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// ── Project Types ────────────────────────────────────────────────────────────

export interface ProjectDto {
  id: string;
  userId: string;
  workstreamId: string;
  goalId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  workstream?: {
    id: string;
    name: string;
    slug: string;
  };
  goal?: {
    id: string;
    title: string;
  } | null;
  _count?: {
    milestones?: number;
    tasks?: number;
  };
}

export interface ProjectQuery {
  page?: number;
  pageSize?: number;
  workstreamId?: string;
  goalId?: string;
  status?: ProjectStatus;
  priority?: TaskPriority;
  search?: string;
  archived?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'targetDate' | 'priority' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// ── Milestone Types ──────────────────────────────────────────────────────────

export interface MilestoneDto {
  id: string;
  userId: string;
  projectId: string;
  name: string;
  description: string | null;
  status: MilestoneStatus;
  sortOrder: number;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    tasks?: number;
  };
}

export interface MilestoneQuery {
  projectId?: string;
  status?: MilestoneStatus;
  search?: string;
}

export interface MilestoneReorderItem {
  id: string;
  sortOrder: number;
}

// ── Task Types ───────────────────────────────────────────────────────────────

export type TaskStatus =
  | 'BACKLOG'
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'DONE'
  | 'CANCELLED';

export type TaskDependencyType = 'BLOCKS' | 'BLOCKED_BY';

export interface TaskDependencyDto {
  id: string;
  blockingTaskId: string;
  dependentTaskId: string;
  dependencyType: TaskDependencyType;
  createdAt: string;
  blockingTask?: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  };
  dependentTask?: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  };
}

export interface TaskDto {
  id: string;
  userId: string;
  projectId: string;
  milestoneId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimateMinutes: number;
  actualMinutes: number;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  };
  milestone?: {
    id: string;
    name: string;
  } | null;
  parentTask?: {
    id: string;
    title: string;
  } | null;
  subtasks?: TaskDto[];
  blockingDependencies?: TaskDependencyDto[];
  dependentDependencies?: TaskDependencyDto[];
  isReady?: boolean;
  isBlocked?: boolean;
  _count?: {
    subtasks?: number;
    blockingDependencies?: number;
    dependentDependencies?: number;
  };
}

export interface TaskQuery {
  page?: number;
  pageSize?: number;
  projectId?: string;
  milestoneId?: string;
  parentTaskId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  overdue?: boolean;
  ready?: boolean;
  blocked?: boolean;
  completed?: boolean;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'dueDate'
    | 'priority'
    | 'status'
    | 'sortOrder'
    | 'title'
    | 'estimateMinutes';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskReorderItem {
  id: string;
  sortOrder: number;
}

// ── Dashboard & Next Best Action Types ────────────────────────────────────────

export interface DashboardSummaryDto {
  activeWorkstreams: number;
  activeGoals: number;
  activeProjects: number;
  readyTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  completedTasksRecent: number;
}

export interface NextBestActionReasonDto {
  category: string;
  points: number;
  description: string;
}

export interface NextBestActionDto {
  recommendedTask: TaskDto | null;
  score: number;
  reasons: NextBestActionReasonDto[];
  candidatePoolCount: number;
  evaluatedAt: string;
}

export interface RecentActivityDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  createdAt: string;
}

export interface DashboardDto {
  summary: DashboardSummaryDto;
  nextBestAction: NextBestActionDto | null;
  today: {
    date: string;
    dueToday: TaskDto[];
    inProgress: TaskDto[];
    ready: TaskDto[];
  };
  workstreams: WorkstreamDto[];
  activeProjects: ProjectDto[];
  blockedTasks: TaskDto[];
  overdueTasks: TaskDto[];
  upcomingTasks: TaskDto[];
  recentActivity: RecentActivityDto[];
}

export interface DashboardQuery {
  date?: string;
  timezone?: string;
}

// ── Planning & Capacity Engine Types ─────────────────────────────────────────

export type TimeBlockStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'INTERRUPTED';

export interface DailyPlanDto {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mustWinTaskId: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  mustWinTask?: TaskDto | null;
}

export interface TimeBlockDto {
  id: string;
  userId: string;
  dailyPlanId: string | null;
  taskId: string | null;
  title: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  status: TimeBlockStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  task?: TaskDto | null;
  durationMinutes?: number;
}

export interface WeeklyPlanDto {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  theme: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCapacityDto {
  date: string;
  capacityMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  utilizationPercent: number | null;
  overCapacity: boolean;
}

export interface WeeklyCapacityDto {
  weekStart: string;
  weekEnd: string;
  capacityMinutes: number;
  plannedMinutes: number;
  remainingMinutes: number;
  utilizationPercent: number | null;
  overCapacity: boolean;
  dailyBreakdown: DailyCapacityDto[];
}

export interface ScheduleConflictDto {
  conflictingBlockId: string;
  conflictingTitle: string;
  startAt: string;
  endAt: string;
}

export interface DailyPlanningResponseDto {
  date: string;
  plan: DailyPlanDto | null;
  mustWinTask: TaskDto | null;
  timeBlocks: TimeBlockDto[];
  capacity: DailyCapacityDto;
  conflicts: ScheduleConflictDto[];
  unscheduledReadyTasks: TaskDto[];
}

export interface WeeklyPlanningResponseDto {
  weekStart: string;
  weekEnd: string;
  plan: WeeklyPlanDto | null;
  capacity: WeeklyCapacityDto;
  dailyPlans: DailyPlanDto[];
  unscheduledReadyTasks: TaskDto[];
}

export interface CreateDailyPlanInput {
  date: string;
  mustWinTaskId?: string | null;
  notes?: string | null;
  status?: string;
}

export interface UpdateDailyPlanInput {
  mustWinTaskId?: string | null;
  notes?: string | null;
  status?: string;
}

export interface CreateTimeBlockInput {
  dailyPlanId?: string | null;
  taskId?: string | null;
  title: string;
  startAt: string;
  endAt: string;
  status?: TimeBlockStatus;
  notes?: string | null;
}

export interface UpdateTimeBlockInput {
  dailyPlanId?: string | null;
  taskId?: string | null;
  title?: string;
  startAt?: string;
  endAt?: string;
  status?: TimeBlockStatus;
  notes?: string | null;
}

export interface CreateWeeklyPlanInput {
  weekStart: string;
  theme?: string | null;
  notes?: string | null;
  status?: string;
}

export interface UpdateWeeklyPlanInput {
  theme?: string | null;
  notes?: string | null;
  status?: string;
}

// ── Learning & Skills Intelligence Types ─────────────────────────────────────

export type LearningItemType =
  | 'COURSE'
  | 'BOOK'
  | 'TUTORIAL'
  | 'DOCUMENTATION'
  | 'LECTURE'
  | 'PROJECT'
  | 'PRACTICE'
  | 'ARTICLE'
  | 'OTHER';

export type LearningItemStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PAUSED'
  | 'CANCELLED';

export type SkillLevel =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT';

export type SkillStatus = 'ACTIVE' | 'PAUSED' | 'MASTERED' | 'ARCHIVED';

export type SkillRelevance = 'PRIMARY' | 'SECONDARY';

export interface SkillDto {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  status: SkillStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    learningItems?: number;
  };
}

export interface LearningActivityDto {
  id: string;
  userId: string;
  learningItemId: string;
  date: string;
  minutes: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningItemSkillDto {
  id: string;
  learningItemId: string;
  skillId: string;
  relevance: SkillRelevance;
  createdAt: string;
  skill?: SkillDto;
}

export interface LearningItemDto {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  type: LearningItemType;
  status: LearningItemStatus;
  source: string | null;
  url: string | null;
  estimatedMinutes: number;
  progressPercent: number;
  startedAt: string | null;
  targetDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  skills?: LearningItemSkillDto[];
  totalLoggedMinutes?: number;
  _count?: {
    activities?: number;
    skills?: number;
  };
}

export interface LearningMetricsDto {
  totalItems: number;
  inProgressItems: number;
  completedItems: number;
  totalLoggedMinutes: number;
  activeSkillsCount: number;
  linkedProjectsCount: number;
}

export interface SkillDetailDto extends SkillDto {
  learningItems: LearningItemDto[];
  appliedProjects: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface CreateSkillInput {
  name: string;
  slug?: string;
  description?: string | null;
  category?: string | null;
  currentLevel?: SkillLevel;
  targetLevel?: SkillLevel;
  status?: SkillStatus;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string | null;
  category?: string | null;
  currentLevel?: SkillLevel;
  targetLevel?: SkillLevel;
  status?: SkillStatus;
}

export interface SkillQuery {
  page?: number;
  pageSize?: number;
  status?: SkillStatus;
  category?: string;
  search?: string;
}

export interface CreateLearningItemInput {
  projectId?: string | null;
  title: string;
  description?: string | null;
  type?: LearningItemType;
  status?: LearningItemStatus;
  source?: string | null;
  url?: string | null;
  estimatedMinutes?: number;
  targetDate?: string | null;
}

export interface UpdateLearningItemInput {
  projectId?: string | null;
  title?: string;
  description?: string | null;
  type?: LearningItemType;
  status?: LearningItemStatus;
  source?: string | null;
  url?: string | null;
  estimatedMinutes?: number;
  progressPercent?: number;
  targetDate?: string | null;
}

export interface LearningItemQuery {
  page?: number;
  pageSize?: number;
  status?: LearningItemStatus;
  type?: LearningItemType;
  projectId?: string;
  search?: string;
}

export interface RecordLearningActivityInput {
  minutes: number;
  notes?: string | null;
  date?: string;
}

export interface LinkLearningSkillInput {
  skillId: string;
  relevance?: SkillRelevance;
}

// ── Evidence & Reviews Intelligence Enums & Types ──────────────────────────────

export type EvidenceType =
  | 'GITHUB_REPOSITORY'
  | 'GIT_COMMIT'
  | 'DEPLOYMENT'
  | 'PROJECT'
  | 'DOCUMENT'
  | 'SCREENSHOT'
  | 'VIDEO'
  | 'CERTIFICATE'
  | 'ASSIGNMENT'
  | 'EXAM_RESULT'
  | 'PRESENTATION'
  | 'ARTICLE'
  | 'CLIENT_DELIVERY'
  | 'PROTOTYPE'
  | 'RESEARCH_RESULT'
  | 'OTHER';

export type ReviewStatus = 'DRAFT' | 'COMPLETED';

export interface EvidenceTaskDto {
  id: string;
  evidenceId: string;
  taskId: string;
  createdAt: string;
  task?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface EvidenceProjectDto {
  id: string;
  evidenceId: string;
  projectId: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface EvidenceLearningItemDto {
  id: string;
  evidenceId: string;
  learningItemId: string;
  createdAt: string;
  learningItem?: {
    id: string;
    title: string;
    type: string;
  };
}

export interface EvidenceSkillDto {
  id: string;
  evidenceId: string;
  skillId: string;
  createdAt: string;
  skill?: {
    id: string;
    name: string;
    currentLevel: string;
  };
}

export interface EvidenceDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: EvidenceType;
  url: string | null;
  externalReference: string | null;
  date: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  tasks?: EvidenceTaskDto[];
  projects?: EvidenceProjectDto[];
  learningItems?: EvidenceLearningItemDto[];
  skills?: EvidenceSkillDto[];
}

export interface CreateEvidenceInput {
  title: string;
  description?: string | null;
  type?: EvidenceType;
  url?: string | null;
  externalReference?: string | null;
  date?: string;
  taskId?: string | null;
  projectId?: string | null;
  learningItemId?: string | null;
  skillId?: string | null;
}

export interface UpdateEvidenceInput {
  title?: string;
  description?: string | null;
  type?: EvidenceType;
  url?: string | null;
  externalReference?: string | null;
  date?: string;
}

export interface EvidenceQuery {
  page?: number;
  pageSize?: number;
  type?: EvidenceType;
  search?: string;
  projectId?: string;
  taskId?: string;
  learningItemId?: string;
  skillId?: string;
}

export interface WeeklyReviewDto {
  id: string;
  userId: string;
  weeklyPlanId: string | null;
  status: ReviewStatus;
  wins: string | null;
  challenges: string | null;
  lessons: string | null;
  nextFocus: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeeklyReviewInput {
  weeklyPlanId?: string | null;
  wins?: string | null;
  challenges?: string | null;
  lessons?: string | null;
  nextFocus?: string | null;
  notes?: string | null;
}

export interface UpdateWeeklyReviewInput {
  wins?: string | null;
  challenges?: string | null;
  lessons?: string | null;
  nextFocus?: string | null;
  notes?: string | null;
  status?: ReviewStatus;
}

export interface WeeklyReviewQuery {
  page?: number;
  pageSize?: number;
  status?: ReviewStatus;
  weekStart?: string;
}

export interface WeeklyReviewContextDto {
  weekStart: string;
  weekEnd: string;
  completedTasks: number;
  blockedTasks: number;
  cancelledTasks: number;
  plannedMinutes: number;
  actualLoggedMinutes: number;
  learningMinutes: number;
  learningItemsCompleted: number;
  skillsUpdated: number;
  evidenceCreated: number;
  activeProjects: number;
  overCapacityDays: number;
}

// ── Analytics Interfaces ─────────────────────────────────────────────────────

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'custom';
export type AnalyticsGranularity = 'day' | 'week' | 'month';

export interface AnalyticsQuery {
  from?: string;
  to?: string;
  period?: AnalyticsPeriod;
  granularity?: AnalyticsGranularity;
}

export interface AnalyticsOverviewDto {
  period: {
    from: string;
    to: string;
    period: AnalyticsPeriod;
  };
  execution: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    readyTasks: number;
    blockedTasks: number;
    reviewTasks: number;
    cancelledTasks: number;
    overdueTasks: number;
    completionRate: number | null;
    estimatedMinutes: number;
    actualMinutes: number;
    completedEstimatedMinutes: number;
  };
  planning: {
    daysPlanned: number;
    daysWithTimeBlocks: number;
    plannedMinutes: number;
    daysWithCompletedPlans: number;
    plannedTaskMinutes: number;
    tasklessPlannedMinutes: number;
  };
  learning: {
    learningItemsTotal: number;
    learningItemsStarted: number;
    learningItemsCompleted: number;
    learningItemsInProgress: number;
    learningItemsPaused: number;
    learningMinutes: number;
    learningActivityDays: number;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
  };
  goals: {
    totalGoals: number;
    inProgressGoals: number;
    achievedGoals: number;
  };
  evidence: {
    evidenceCreated: number;
    evidenceVerified: number;
    evidenceUnverified: number;
  };
  capacity: {
    availableMinutes: number;
    plannedMinutes: number;
    remainingMinutes: number;
    utilizationPercentage: number | null;
    overCapacityDays: number;
  };
  reviews: {
    reviewsCreated: number;
    reviewsCompleted: number;
    reviewsDraft: number;
  };
}

export interface ExecutionTrendPointDto {
  date: string;
  completedTasks: number;
  createdTasks: number;
  blockedTasks: number;
  overdueTasks: number;
}

export interface ProjectAnalyticsItemDto {
  projectId: string;
  projectName: string;
  workstreamName: string | null;
  goalTitle: string | null;
  status: string;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  completionPercentage: number | null;
}

export interface GoalAnalyticsItemDto {
  goalId: string;
  title: string;
  workstreamName: string | null;
  status: string;
  priority: string;
  projectsTotal: number;
  activeProjects: number;
  completedProjects: number;
  tasksTotal: number;
  completedTasks: number;
  overdueTasks: number;
  targetDate: string | null;
  progressPercentage: number | null;
}

export interface WorkstreamAnalyticsItemDto {
  workstreamId: string;
  name: string;
  status: string;
  priorityWeight: number;
  goalsCount: number;
  activeGoals: number;
  projectsCount: number;
  activeProjects: number;
  tasksCount: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  learningItems: number;
  learningMinutes: number;
  evidenceCount: number;
}

export interface PlanningAnalyticsDto {
  daysPlanned: number;
  daysWithTimeBlocks: number;
  plannedMinutes: number;
  daysWithCompletedPlans: number;
  plannedTaskMinutes: number;
  tasklessPlannedMinutes: number;
  estimatedTaskMinutes: number;
  scheduledTimeBlockMinutes: number;
  actualLoggedTaskMinutes: number;
}

export interface CapacityAnalyticsDto {
  totalAvailableMinutes: number;
  totalPlannedMinutes: number;
  totalRemainingMinutes: number;
  utilizationPercentage: number | null;
  overCapacityDays: number;
  daysEvaluated: number;
}

export interface OverdueAnalyticsDto {
  currentOverdueTasks: number;
  overdueCreatedDuringPeriod: number;
  overdueCompletedDuringPeriod: number;
  overdueByWorkstream: { name: string; count: number }[];
  overdueByProject: { name: string; count: number }[];
}

export interface BlockedAnalyticsDto {
  currentlyBlocked: number;
  blockedDuringPeriod: number;
  unblockedDuringPeriod: number;
  dependencyBlocked: number;
  manuallyBlocked: number;
}

export interface LearningAnalyticsDto {
  learningItemsTotal: number;
  learningItemsStarted: number;
  learningItemsCompleted: number;
  learningItemsInProgress: number;
  learningItemsPaused: number;
  learningMinutes: number;
  learningActivityDays: number;
}

export interface LearningTrendPointDto {
  date: string;
  minutes: number;
  activities: number;
  itemsCompleted: number;
}

export interface SkillAnalyticsItemDto {
  skillId: string;
  name: string;
  category: string | null;
  currentLevel: string;
  targetLevel: string;
  status: string;
  linkedLearningItems: number;
  linkedProjects: number;
  linkedEvidence: number;
}

export interface EvidenceAnalyticsDto {
  evidenceCreated: number;
  evidenceVerified: number;
  evidenceUnverified: number;
  byType: { type: string; count: number }[];
}

export interface EvidenceTrendPointDto {
  date: string;
  evidenceCreated: number;
}

export interface ReviewAnalyticsDto {
  reviewsCreated: number;
  reviewsCompleted: number;
  reviewsDraft: number;
}

export interface WeeklyHistorySnapshotDto {
  weekStart: string;
  weekEnd: string;
  tasksCompleted: number;
  tasksCreated: number;
  tasksBlocked: number;
  tasksOverdue: number;
  plannedMinutes: number;
  availableMinutes: number;
  learningMinutes: number;
  learningItemsCompleted: number;
  evidenceCreated: number;
  projectsActive: number;
  projectsCompleted: number;
  reviewCompleted: boolean;
}

// ── Opportunities Interfaces ─────────────────────────────────────────────────

export type OpportunityType =
  | 'FREELANCE'
  | 'INTERNSHIP'
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'CLIENT'
  | 'RESEARCH'
  | 'COLLABORATION'
  | 'ENTREPRENEURIAL'
  | 'COMPETITION'
  | 'SCHOLARSHIP'
  | 'EVENT'
  | 'OTHER';

export type OpportunityStatus =
  | 'DISCOVERED'
  | 'EVALUATING'
  | 'PREPARING'
  | 'APPLIED'
  | 'IN_DISCUSSION'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'ARCHIVED';

export type OpportunitySource =
  | 'DIRECT_CONTACT'
  | 'COMPANY_WEBSITE'
  | 'LINKEDIN'
  | 'UPWORK'
  | 'REFERRAL'
  | 'UNIVERSITY'
  | 'YOMTECH'
  | 'PERSONAL_NETWORK'
  | 'EMAIL'
  | 'EVENT'
  | 'OTHER';

export type OpportunityActivityType =
  | 'NOTE'
  | 'CONTACT'
  | 'APPLICATION_SUBMITTED'
  | 'INTERVIEW'
  | 'FOLLOW_UP'
  | 'OFFER'
  | 'STATUS_CHANGE'
  | 'OTHER';

export interface OpportunityDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: OpportunityType;
  status: OpportunityStatus;
  priority: TaskPriority;
  organizationName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  source: OpportunitySource;
  sourceUrl: string | null;
  location: string | null;
  remote: boolean;
  estimatedValue: number | null;
  currency: string;
  startDate: string | null;
  deadline: string | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  _count?: {
    skills?: number;
    projects?: number;
    evidence?: number;
    tasks?: number;
    activities?: number;
  };
}

export interface OpportunitySkillDto {
  id: string;
  opportunityId: string;
  skillId: string;
  relevance: SkillRelevance;
  createdAt: string;
  skill?: SkillDto;
}

export interface OpportunityProjectDto {
  id: string;
  opportunityId: string;
  projectId: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

export interface OpportunityEvidenceDto {
  id: string;
  opportunityId: string;
  evidenceId: string;
  createdAt: string;
  evidence?: EvidenceDto;
}

export interface OpportunityTaskDto {
  id: string;
  opportunityId: string;
  taskId: string;
  createdAt: string;
  task?: TaskDto;
}

export interface OpportunityActivityDto {
  id: string;
  opportunityId: string;
  userId: string;
  type: OpportunityActivityType;
  title: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface OpportunityDetailDto extends OpportunityDto {
  skills: OpportunitySkillDto[];
  projects: OpportunityProjectDto[];
  evidence: OpportunityEvidenceDto[];
  tasks: OpportunityTaskDto[];
  activities: OpportunityActivityDto[];
}

export interface CreateOpportunityInput {
  title: string;
  description?: string | null;
  type?: OpportunityType;
  status?: OpportunityStatus;
  priority?: TaskPriority;
  organizationName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  source?: OpportunitySource;
  sourceUrl?: string | null;
  location?: string | null;
  remote?: boolean;
  estimatedValue?: number | null;
  currency?: string;
  startDate?: string | null;
  deadline?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
}

export interface UpdateOpportunityInput {
  title?: string;
  description?: string | null;
  type?: OpportunityType;
  status?: OpportunityStatus;
  priority?: TaskPriority;
  organizationName?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  source?: OpportunitySource;
  sourceUrl?: string | null;
  location?: string | null;
  remote?: boolean;
  estimatedValue?: number | null;
  currency?: string;
  startDate?: string | null;
  deadline?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
}

export interface OpportunityQuery {
  page?: number;
  pageSize?: number;
  status?: OpportunityStatus;
  type?: OpportunityType;
  priority?: TaskPriority;
  source?: OpportunitySource;
  remote?: boolean;
  search?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
}

export interface OpportunityFollowUpsDto {
  overdue: OpportunityDto[];
  today: OpportunityDto[];
  upcoming: OpportunityDto[];
}

export interface OpportunityDeadlinesDto {
  overdue: OpportunityDto[];
  today: OpportunityDto[];
  next7Days: OpportunityDto[];
  next30Days: OpportunityDto[];
}

export interface OpportunityAnalyticsDto {
  totalOpportunities: number;
  activeOpportunities: number;
  appliedOpportunities: number;
  interviews: number;
  offers: number;
  accepted: number;
  completed: number;
  rejected: number;
  withdrawn: number;
  expired: number;
  followUpsDue: number;
  followUpsOverdue: number;
  byStatus: { status: string; count: number }[];
  byType: { type: string; count: number }[];
}

// ── Intelligence Core Types ──────────────────────────────────────────────────

export type MemoryCategory =
  | 'PREFERENCE'
  | 'WORKFLOW'
  | 'GOAL_CONTEXT'
  | 'PROJECT_CONTEXT'
  | 'LEARNING_PREFERENCE'
  | 'COMMUNICATION_PREFERENCE'
  | 'OTHER';

export interface ConversationDto {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  _count?: {
    messages?: number;
  };
}

export interface ConversationMessageDto {
  id: string;
  conversationId: string;
  userId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface UserMemoryDto {
  id: string;
  userId: string;
  key: string;
  value: string;
  category: MemoryCategory;
  source: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface ActionProposalDto {
  id: string;
  actionType: 'CREATE_TASK' | 'CREATE_TIME_BLOCK' | 'CREATE_MEMORY' | 'UPDATE_TASK' | 'OTHER';
  summary: string;
  details: Record<string, unknown>;
  requiresConfirmation: boolean;
  status: 'PROPOSED' | 'CONFIRMED' | 'CANCELLED' | 'EXECUTED' | 'FAILED';
}

export interface IntelligenceChatInput {
  conversationId?: string;
  message: string;
}

export interface IntelligenceChatOutput {
  conversationId: string;
  message: ConversationMessageDto;
  contextSummary?: {
    todayTasksCount?: number;
    blockedTasksCount?: number;
    activeProjectsCount?: number;
    capacityMinutes?: number;
    nextBestActionTitle?: string;
  };
  proposal?: ActionProposalDto | null;
  facts?: string[];
  inferences?: string[];
  recommendations?: string[];
}

export interface ActionExecutionInput {
  proposalId: string;
  confirm: boolean;
  overrides?: Record<string, unknown>;
}

export interface CreateUserMemoryInput {
  key: string;
  value: string;
  category?: MemoryCategory;
  source?: string;
  confidence?: number;
}

export interface UpdateUserMemoryInput {
  value?: string;
  category?: MemoryCategory;
  archived?: boolean;
}









