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


