import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoalDto, GoalStatus, TaskPriority, WorkstreamDto } from '@kenenisa-os/shared';
import { fetchGoals, createGoal, updateGoal, completeGoal, reopenGoal } from '../features/goals/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

const GOAL_BOARD_COLUMNS: {
  status: GoalStatus;
  label: string;
  dotColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
}[] = [
  {
    status: 'PLANNED',
    label: 'Planned',
    dotColor: 'bg-sky-500',
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-700',
    borderBadge: 'border-sky-200',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    dotColor: 'bg-blue-600',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-700',
    borderBadge: 'border-blue-200',
  },
  {
    status: 'ACHIEVED',
    label: 'Achieved',
    dotColor: 'bg-emerald-600',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
  },
  {
    status: 'CANCELLED',
    label: 'Cancelled / Paused',
    dotColor: 'bg-slate-400',
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-600',
    borderBadge: 'border-slate-200',
  },
];

export const GoalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<GoalDto[]>(() => getCachedApiData<GoalDto[]>('/api/v1/goals') || []);
  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [loading, setLoading] = useState(() => !getCachedApiData<GoalDto[]>('/api/v1/goals'));
  const [error, setError] = useState<string | null>(null);

  // View Mode: Grid Gallery vs Notion Roadmap Board
  const [viewMode, setViewMode] = useState<'grid' | 'board'>(() => {
    return (localStorage.getItem('kenenisa_goals_view_mode') as 'grid' | 'board') || 'grid';
  });

  const handleSetViewMode = (mode: 'grid' | 'board') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_goals_view_mode', mode);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [workstreamIdFilter, setWorkstreamIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<GoalStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [workstreamId, setWorkstreamId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P1');
  const [targetDate, setTargetDate] = useState('');
  const [createInitialStatus, setCreateInitialStatus] = useState<GoalStatus>('PLANNED');
  const [submitting, setSubmitting] = useState(false);

  // Edit Goal State
  const [editingGoal, setEditingGoal] = useState<GoalDto | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalWorkstreamId, setEditGoalWorkstreamId] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');
  const [editGoalPriority, setEditGoalPriority] = useState<TaskPriority>('P1');
  const [editGoalTargetDate, setEditGoalTargetDate] = useState('');
  const [editGoalStatus, setEditGoalStatus] = useState<GoalStatus>('PLANNED');
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  const handleOpenEditGoal = (g: GoalDto) => {
    setEditingGoal(g);
    setEditGoalTitle(g.title);
    setEditGoalWorkstreamId(g.workstreamId);
    setEditGoalDescription(g.description || '');
    setEditGoalPriority(g.priority);
    setEditGoalTargetDate(g.targetDate ? g.targetDate.split('T')[0] : '');
    setEditGoalStatus(g.status);
  };

  const handleUpdateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editGoalTitle.trim()) return;
    setIsUpdatingGoal(true);
    try {
      await updateGoal(editingGoal.id, {
        title: editGoalTitle.trim(),
        workstreamId: editGoalWorkstreamId,
        description: editGoalDescription.trim() || null,
        priority: editGoalPriority,
        targetDate: editGoalTargetDate ? new Date(editGoalTargetDate).toISOString() : null,
        status: editGoalStatus,
      });
      showToast(`Goal "${editGoalTitle.trim()}" updated successfully`, 'success');
      setEditingGoal(null);
      await loadGoals();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update goal', 'error');
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const loadWorkstreams = useCallback(async () => {
    try {
      const data = await fetchWorkstreams({ pageSize: 100 });
      setWorkstreams(data);
      if (data.length > 0 && !workstreamId) {
        setWorkstreamId(data[0].id);
      }
    } catch {
      // Ignore workstream load errors silently
    }
  }, [workstreamId]);

  const loadGoals = useCallback(async () => {
    if (goals.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchGoals({
        search: search || undefined,
        workstreamId: workstreamIdFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setGoals(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading goals');
    } finally {
      setLoading(false);
    }
  }, [goals.length, search, workstreamIdFilter, statusFilter, priorityFilter]);

  useEffect(() => {
    void loadWorkstreams();
  }, [loadWorkstreams]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workstreamId) return;

    setSubmitting(true);
    try {
      const created = await createGoal({
        title: title.trim(),
        workstreamId,
        description: description.trim() || undefined,
        priority,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      if (createInitialStatus && createInitialStatus !== 'PLANNED' && created?.id) {
        await updateGoal(created.id, { status: createInitialStatus });
      }

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setCreateInitialStatus('PLANNED');
      showToast('Strategic goal created successfully', 'success');
      await loadGoals();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create goal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal: GoalDto) => {
    try {
      if (goal.status === 'ACHIEVED') {
        await reopenGoal(goal.id);
        showToast('Goal reopened to In Progress', 'info');
      } else {
        await completeGoal(goal.id);
        showToast('Goal achieved! Great accomplishment.', 'success');
      }
      await loadGoals();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update goal status', 'error');
    }
  };

  const handleQuickStatusChange = async (goalId: string, newStatus: GoalStatus) => {
    try {
      await updateGoal(goalId, { status: newStatus });
      showToast(`Goal moved to ${newStatus.replace('_', ' ')}`, 'success');
      await loadGoals();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to move goal', 'error');
    }
  };

  // Group goals by status for Roadmap Board
  const goalsByStatus = useMemo(() => {
    const map: Record<GoalStatus, GoalDto[]> = {
      PLANNED: [],
      IN_PROGRESS: [],
      ACHIEVED: [],
      CANCELLED: [],
    };
    goals.forEach((g) => {
      if (map[g.status]) {
        map[g.status].push(g);
      } else {
        map.PLANNED.push(g);
      }
    });
    return map;
  }, [goals]);

  const openCreateForStatus = (st: GoalStatus) => {
    setCreateInitialStatus(st);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategic Goals"
        description="High-level milestones and career goals grouped by strategic categories and timelines."
        breadcrumbs={[{ label: 'Build' }, { label: 'Goals' }]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* View Switcher: Grid vs Roadmap Board */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Grid Gallery"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Grid Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Notion-Style Roadmap Board"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Roadmap Board</span>
              </button>
            </div>

            <button
              id="create-goal-btn"
              onClick={() => {
                setCreateInitialStatus('PLANNED');
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Goal</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={workstreamIdFilter}
            onChange={(e) => setWorkstreamIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories / Workstreams</option>
            {workstreams.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GoalStatus | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>

          {(search || workstreamIdFilter || statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setWorkstreamIdFilter('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadGoals()} />
      ) : goals.length === 0 ? (
        <EmptyStateCard
          title="No goals found"
          description="Create your first strategic goal to define major targets."
          actionLabel="Create Goal"
          onAction={() => {
            setCreateInitialStatus('PLANNED');
            setIsCreateOpen(true);
          }}
        />
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE GOAL ROADMAP BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-6">
          {GOAL_BOARD_COLUMNS.map((col) => {
            const colGoals = goalsByStatus[col.status] || [];
            const totalLinkedProjects = colGoals.reduce((sum, g) => sum + (g._count?.projects || 0), 0);

            return (
              <div
                key={col.status}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl flex flex-col max-h-[82vh] shadow-2xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/80 rounded-t-2xl flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shrink-0`} />
                    <h3 className="font-extrabold text-xs text-slate-900 tracking-tight truncate">
                      {col.label}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      {colGoals.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateForStatus(col.status)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title={`Add goal to ${col.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{colGoals.length} target(s)</span>
                  <span>{totalLinkedProjects} linked projects</span>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colGoals.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No goals in {col.label.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.status)}
                        className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        + Add Goal
                      </button>
                    </div>
                  ) : (
                    colGoals.map((g) => (
                      <div
                        key={g.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[140px]">
                              {g.workstream?.name || 'Category'}
                            </span>
                            <Badge variant={g.priority} />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditGoal(g)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit goal"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{g.title}</h4>
                          {g.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                              {g.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span><strong className="text-slate-800">{g._count?.projects || 0}</strong> projects linked</span>
                          </div>
                          {g.targetDate && (
                            <span className="font-mono text-[10px] text-slate-500">
                              🎯 {g.targetDate.split('T')[0]}
                            </span>
                          )}
                        </div>

                        {/* Quick Status Mover */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            {g.status !== 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() => void handleQuickStatusChange(g.id, 'IN_PROGRESS')}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                              >
                                In Progress
                              </button>
                            )}
                            {g.status !== 'ACHIEVED' ? (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(g)}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                              >
                                ✓ Achieve
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(g)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditGoal(g)}
                            className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           GRID GALLERY VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {g.workstream?.name || 'Category'}
                    </span>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{g.title}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={g.priority} />
                    <Badge variant={g.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {g.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Projects: <strong className="text-slate-800">{g._count?.projects || 0}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditGoal(g)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => void handleToggleComplete(g)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      g.status === 'ACHIEVED'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold'
                    }`}
                  >
                    {g.status === 'ACHIEVED' ? 'Reopen Goal' : 'Mark Achieved'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Strategic Goal</h3>
                {createInitialStatus && (
                  <p className="text-[11px] text-slate-500">
                    Status: <strong className="text-blue-600">{createInitialStatus}</strong>
                  </p>
                )}
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workstream / Category *</label>
                <select
                  required
                  value={workstreamId}
                  onChange={(e) => setWorkstreamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Monorepo Architecture"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-level description of success criteria..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Strategic Goal</h3>
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateGoalSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workstream / Category *</label>
                <select
                  required
                  value={editGoalWorkstreamId}
                  onChange={(e) => setEditGoalWorkstreamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={editGoalTitle}
                  onChange={(e) => setEditGoalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editGoalDescription}
                  onChange={(e) => setEditGoalDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editGoalPriority}
                    onChange={(e) => setEditGoalPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editGoalStatus}
                    onChange={(e) => setEditGoalStatus(e.target.value as GoalStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ACHIEVED">Achieved</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={editGoalTargetDate}
                  onChange={(e) => setEditGoalTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  disabled={isUpdatingGoal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingGoal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingGoal ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Central AI Copilot */}
      <PageAiCopilot pageType="goals" />
    </div>
  );
};
