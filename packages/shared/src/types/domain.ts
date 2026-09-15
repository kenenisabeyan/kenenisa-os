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
