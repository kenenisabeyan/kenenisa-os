import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TaskDto, TaskStatus, TaskPriority, ProjectDto, MilestoneDto } from '@kenenisa-os/shared';
import {
  fetchTasks,
  createTask,
  updateTask,
  startTask,
  blockTask,
  completeTask,
  reopenTask,
  cancelTask,
  createSubtask,
  addTaskDependency,
  removeTaskDependency,
} from '../features/tasks/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { fetchMilestones } from '../features/milestones/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';

const KANBAN_COLUMNS: {
  status: TaskStatus;
  label: string;
  dotColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
  desc: string;
}[] = [
  {
    status: 'BACKLOG',
    label: 'Backlog',
    dotColor: 'bg-slate-400',
    bgBadge: 'bg-slate-50',
    textBadge: 'text-slate-700',
    borderBadge: 'border-slate-200',
    desc: 'Unprioritized work items',
  },
  {
    status: 'READY',
    label: 'Ready for Dev',
    dotColor: 'bg-emerald-500',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
    desc: 'Actionable & unblocked',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Progress',
    dotColor: 'bg-blue-600',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-700',
    borderBadge: 'border-blue-200',
    desc: 'Actively being executed',
  },
  {
    status: 'BLOCKED',
    label: 'Blocked',
    dotColor: 'bg-rose-500',
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-700',
    borderBadge: 'border-rose-200',
    desc: 'Awaiting dependency resolution',
  },
  {
    status: 'DONE',
    label: 'Completed',
    dotColor: 'bg-purple-600',
    bgBadge: 'bg-purple-50',
    textBadge: 'text-purple-700',
    borderBadge: 'border-purple-200',
    desc: 'Verified & finished',
  },
];

export const TasksPage: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Notion-style Kanban Board vs List View
  const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
    return (localStorage.getItem('kenenisa_tasks_view_mode') as 'board' | 'list') || 'board';
  });

  const handleSetViewMode = (mode: 'board' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_tasks_view_mode', mode);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [estimateMinutes, setEstimateMinutes] = useState('60');
  const [dueDate, setDueDate] = useState('');
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('BACKLOG');
  const [submitting, setSubmitting] = useState(false);

  // Subtask Modal
  const [activeParentTask, setActiveParentTask] = useState<TaskDto | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskEstimate, setSubtaskEstimate] = useState('30');

  // Dependency Modal
  const [activeDepTask, setActiveDepTask] = useState<TaskDto | null>(null);
  const [blockingTaskId, setBlockingTaskId] = useState('');

  // Edit Task State
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editMilestoneId, setEditMilestoneId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('P2');
  const [editEstimateMinutes, setEditEstimateMinutes] = useState('60');
  const [editActualMinutes, setEditActualMinutes] = useState('0');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('BACKLOG');
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  // Log Time State
  const [loggingTimeTask, setLoggingTimeTask] = useState<TaskDto | null>(null);
  const [logTimeMinutes, setLogTimeMinutes] = useState('30');
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  const handleOpenEditTask = (task: TaskDto) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditProjectId(task.projectId);
    setEditMilestoneId(task.milestoneId || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditEstimateMinutes(String(task.estimateMinutes || 0));
    setEditActualMinutes(String(task.actualMinutes || 0));
    setEditDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setEditStatus(task.status);
  };

  const handleUpdateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    setIsUpdatingTask(true);
    try {
      await updateTask(editingTask.id, {
        title: editTitle.trim(),
        projectId: editProjectId || undefined,
        milestoneId: editMilestoneId ? editMilestoneId : null,
        description: editDescription.trim() || null,
        priority: editPriority,
        estimateMinutes: parseInt(editEstimateMinutes, 10) || 0,
        actualMinutes: parseInt(editActualMinutes, 10) || 0,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        status: editStatus,
      });
      showToast(`Task "${editTitle.trim()}" updated successfully`, 'success');
      setEditingTask(null);
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update task', 'error');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleOpenLogTime = (task: TaskDto) => {
    setLoggingTimeTask(task);
    setLogTimeMinutes('30');
  };

  const handleLogTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingTimeTask) return;
    const addMinutes = parseInt(logTimeMinutes, 10) || 0;
    if (addMinutes <= 0) {
      showToast('Please enter a positive duration in minutes', 'error');
      return;
    }
    setIsLoggingTime(true);
    try {
      const updatedActual = (loggingTimeTask.actualMinutes || 0) + addMinutes;
      await updateTask(loggingTimeTask.id, {
        actualMinutes: updatedActual,
      });
      showToast(`Logged +${addMinutes}m on "${loggingTimeTask.title}" (Total: ${updatedActual}m)`, 'success');
      setLoggingTimeTask(null);
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to log time', 'error');
    } finally {
      setIsLoggingTime(false);
    }
  };

  const loadDependencies = useCallback(async () => {
    try {
      const [projData, msData] = await Promise.all([
        fetchProjects({ pageSize: 100 }),
        fetchMilestones(),
      ]);
      setProjects(projData);
      if (projData.length > 0 && !projectId) {
        setProjectId(projData[0].id);
      }
      setMilestones(msData);
    } catch {
      // Ignore initial dependency load errors
    }
  }, [projectId]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks({
        search: search || undefined,
        projectId: projectIdFilter || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, projectIdFilter, statusFilter, priorityFilter]);

  useEffect(() => {
    void loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setSubmitting(true);
    try {
      const created = await createTask({
        title: title.trim(),
        projectId,
        milestoneId: milestoneId || undefined,
        description: description.trim() || undefined,
        priority,
        estimateMinutes: parseInt(estimateMinutes, 10) || 0,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      // If user launched create from a specific board column other than BACKLOG
      if (createInitialStatus && createInitialStatus !== 'BACKLOG' && created?.id) {
        if (createInitialStatus === 'IN_PROGRESS') {
          await startTask(created.id);
        } else if (createInitialStatus === 'READY' || createInitialStatus === 'BLOCKED') {
          await updateTask(created.id, { status: createInitialStatus });
        }
      }

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setMilestoneId('');
      setDueDate('');
      setCreateInitialStatus('BACKLOG');
      showToast('Task created successfully', 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParentTask || !subtaskTitle.trim()) return;

    try {
      await createSubtask(activeParentTask.id, {
        title: subtaskTitle.trim(),
        projectId: activeParentTask.projectId,
        estimateMinutes: parseInt(subtaskEstimate, 10) || 0,
        priority: activeParentTask.priority,
      });

      setActiveParentTask(null);
      setSubtaskTitle('');
      showToast('Subtask added', 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create subtask', 'error');
    }
  };

  // Interactive Notion-style Subtask Checklist Toggle
  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'DONE') {
        await reopenTask(subtaskId);
        showToast('Subtask marked as pending', 'info');
      } else {
        await completeTask(subtaskId);
        showToast('Subtask completed', 'success');
      }
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle subtask', 'error');
    }
  };

  // Notion-style 1-Click Status Quick Mover
  const handleMoveTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      if (newStatus === 'IN_PROGRESS') {
        await startTask(taskId);
      } else if (newStatus === 'BLOCKED') {
        await blockTask(taskId);
      } else if (newStatus === 'DONE') {
        await completeTask(taskId);
      } else if (newStatus === 'READY' || newStatus === 'BACKLOG' || newStatus === 'REVIEW' || newStatus === 'CANCELLED') {
        await updateTask(taskId, { status: newStatus });
      }
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to move task', 'error');
    }
  };

  const handleAddDependency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepTask || !blockingTaskId) return;

    try {
      await addTaskDependency(activeDepTask.id, {
        blockingTaskId,
        dependencyType: 'BLOCKS',
      });

      setActiveDepTask(null);
      setBlockingTaskId('');
      showToast('Task dependency added', 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to add dependency', 'error');
    }
  };

  const handleRemoveDependency = async (dependentTaskId: string, dependencyId: string) => {
    try {
      await removeTaskDependency(dependentTaskId, dependencyId);
      showToast('Task dependency removed', 'info');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to remove dependency', 'error');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startTask(id);
      showToast('Task started', 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to start task', 'error');
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await blockTask(id);
      showToast('Task marked as blocked', 'warning');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to block task', 'error');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeTask(id);
      showToast('Task completed', 'success');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to complete task', 'error');
    }
  };

  const handleReopen = async (id: string) => {
    try {
      await reopenTask(id);
      showToast('Task reopened', 'info');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reopen task', 'error');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelTask(id);
      showToast('Task cancelled', 'info');
      await loadTasks();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel task', 'error');
    }
  };

  // Group tasks by status for Kanban Board
  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskDto[]> = {
      BACKLOG: [],
      READY: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      REVIEW: [],
      DONE: [],
      CANCELLED: [],
    };
    tasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.BACKLOG.push(t);
      }
    });
    return map;
  }, [tasks]);

  const filteredMilestonesForProject = milestones.filter(
    (m) => !projectId || m.projectId === projectId,
  );

  const openCreateForStatus = (st: TaskStatus) => {
    setCreateInitialStatus(st);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executable Task Engine"
        description="Deterministic execution units, interactive subtasks, blockers & multi-view Notion board."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Tasks' }]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* View Switcher: Board vs List */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Notion-style Kanban Board"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Kanban Board</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Table / List View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>List View</span>
              </button>
            </div>

            <button
              id="create-task-btn"
              onClick={() => {
                setCreateInitialStatus('BACKLOG');
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        }
      />

      <PageAiCopilot pageType="tasks" />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="READY">Ready</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>

          {(search || projectIdFilter || statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setProjectIdFilter('');
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

      {/* Task Content */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-24" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadTasks()} />
      ) : tasks.length === 0 ? (
        <EmptyStateCard
          title="No tasks found"
          description="Create an executable task to start building out project action items and dependencies."
          actionLabel="Create Task"
          onAction={() => {
            setCreateInitialStatus('BACKLOG');
            setIsCreateOpen(true);
          }}
        />
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE KANBAN BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = tasksByStatus[col.status] || [];
            const totalEstMin = colTasks.reduce((sum, t) => sum + (t.estimateMinutes || 0), 0);
            const totalSpentMin = colTasks.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);

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
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openCreateForStatus(col.status)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title={`Add task to ${col.label}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Column Meta (Estimates) */}
                <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Est: {totalEstMin >= 60 ? `${(totalEstMin / 60).toFixed(1)}h` : `${totalEstMin}m`}</span>
                  <span>Spent: {totalSpentMin >= 60 ? `${(totalSpentMin / 60).toFixed(1)}h` : `${totalSpentMin}m`}</span>
                </div>

                {/* Column Task Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No tasks in {col.label.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.status)}
                        className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        + Add Task
                      </button>
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const completedSubtasks = task.subtasks?.filter((s) => s.status === 'DONE').length || 0;
                      const totalSubtasks = task.subtasks?.length || 0;
                      const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

                      return (
                        <div
                          key={task.id}
                          className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all space-y-2.5 group"
                        >
                          {/* Tags & Action Icons */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Priority */}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  task.priority === 'P0'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : task.priority === 'P1'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : task.priority === 'P2'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {task.priority}
                              </span>

                              {/* Project Tag */}
                              {task.project && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200 truncate max-w-[120px]">
                                  {task.project.name}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenLogTime(task)}
                                className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Log Time"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditTask(task)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit Task"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4
                            className={`text-xs font-bold text-slate-900 leading-snug ${
                              task.status === 'DONE' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {task.title}
                          </h4>

                          {/* Description Snippet */}
                          {task.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Milestone */}
                          {task.milestone && (
                            <div className="text-[10px] font-bold text-purple-700 bg-purple-50/70 border border-purple-200/70 rounded-md px-2 py-0.5 truncate">
                              🎯 {task.milestone.name}
                            </div>
                          )}

                          {/* Blockers alert */}
                          {task.blockingDependencies && task.blockingDependencies.length > 0 && (
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-800 space-y-1">
                              <span className="font-bold flex items-center gap-1">
                                ⚠️ Blocked by {task.blockingDependencies.length} task(s):
                              </span>
                              <div className="space-y-0.5 pl-1.5">
                                {task.blockingDependencies.map((dep) => (
                                  <div key={dep.id} className="truncate text-rose-700 font-medium">
                                    • {dep.blockingTask?.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interactive Subtasks Checklist */}
                          {totalSubtasks > 0 && (
                            <div className="bg-slate-50/90 border border-slate-200/80 rounded-lg p-2 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-600">
                                  Subtasks ({completedSubtasks}/{totalSubtasks})
                                </span>
                                <span className="font-black text-emerald-600">{subtaskPercent}%</span>
                              </div>
                              {/* Progress bar */}
                              <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${subtaskPercent}%` }}
                                />
                              </div>
                              {/* Subtask interactive items */}
                              <div className="space-y-1 pt-0.5">
                                {task.subtasks!.map((st) => (
                                  <div
                                    key={st.id}
                                    className="flex items-center gap-1.5 text-[11px] group/st"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => void handleToggleSubtask(st.id, st.status)}
                                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                        st.status === 'DONE'
                                          ? 'bg-emerald-600 text-white'
                                          : 'border border-slate-300 hover:border-blue-500 bg-white'
                                      }`}
                                      title={st.status === 'DONE' ? 'Mark subtask todo' : 'Complete subtask'}
                                    >
                                      {st.status === 'DONE' && (
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </button>
                                    <span
                                      className={`truncate flex-1 text-slate-700 ${
                                        st.status === 'DONE' ? 'line-through text-slate-400' : ''
                                      }`}
                                    >
                                      {st.title}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                      {st.estimateMinutes}m
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Time & Due Date Footer */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span>Est: <strong className="text-slate-800">{task.estimateMinutes}m</strong></span>
                              <span>&bull;</span>
                              <span>Act: <strong className="text-slate-800">{task.actualMinutes || 0}m</strong></span>
                            </div>
                            {task.dueDate && (
                              <span
                                className={`font-mono ${
                                  new Date(task.dueDate) < new Date() && task.status !== 'DONE'
                                    ? 'text-rose-600 font-bold'
                                    : 'text-slate-500'
                                }`}
                              >
                                {task.dueDate.split('T')[0]}
                              </span>
                            )}
                          </div>

                          {/* Notion-Style Quick Move Bar & Subtask Add */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setActiveParentTask(task)}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              + Subtask
                            </button>

                            {/* Quick status moves */}
                            <div className="flex items-center gap-1">
                              {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                                <button
                                  type="button"
                                  onClick={() => void handleStart(task.id)}
                                  className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                                  title="Start this task"
                                >
                                  ▶ Start
                                </button>
                              )}
                              {task.status === 'IN_PROGRESS' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void handleBlock(task.id)}
                                    className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-colors cursor-pointer"
                                    title="Mark task blocked"
                                  >
                                    Block
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleComplete(task.id)}
                                    className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                                    title="Complete this task"
                                  >
                                    ✓ Done
                                  </button>
                                </>
                              )}
                              {task.status === 'READY' && (
                                <button
                                  type="button"
                                  onClick={() => void handleComplete(task.id)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                                  title="Complete this task"
                                >
                                  ✓ Done
                                </button>
                              )}
                              {task.status === 'BLOCKED' && (
                                <button
                                  type="button"
                                  onClick={() => void handleMoveTaskStatus(task.id, 'READY')}
                                  className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                                  title="Mark as unblocked and ready"
                                >
                                  Unblock
                                </button>
                              )}
                              {task.status === 'DONE' && (
                                <button
                                  type="button"
                                  onClick={() => void handleReopen(task.id)}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                                  title="Reopen task"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           LIST VIEW (UPGRADED WITH INTERACTIVE SUBTASKS & NOTION TOUCHES)
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="space-y-3">
          {tasks.map((task) => {
            const completedSubtasks = task.subtasks?.filter((s) => s.status === 'DONE').length || 0;
            const totalSubtasks = task.subtasks?.length || 0;
            const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-slate-300 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        {task.project?.name}
                      </span>
                      {task.milestone && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Milestone: {task.milestone.name}
                        </span>
                      )}

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === 'P0'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'P1'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : task.priority === 'P2'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.status === 'READY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : task.status === 'BLOCKED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.status === 'DONE'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 line-through'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold text-slate-900 tracking-tight ${
                        task.status === 'DONE' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  {/* Estimate & Time */}
                  <div className="text-right text-[11px] text-slate-500 shrink-0 space-y-0.5">
                    <div>Est: <strong className="text-slate-800">{task.estimateMinutes}m</strong></div>
                    <div>Spent: <strong className="text-slate-800">{task.actualMinutes || 0}m</strong></div>
                    {task.dueDate && (
                      <div className="text-slate-500 font-mono text-[10px]">
                        Due: {task.dueDate.split('T')[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blockers list if any */}
                {task.blockingDependencies && task.blockingDependencies.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-800 space-y-1">
                    <div className="font-semibold text-[11px] text-rose-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Blocked By:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.blockingDependencies.map((dep) => (
                        <div
                          key={dep.id}
                          className="bg-white border border-rose-200 px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1.5 text-rose-700"
                        >
                          <span>{dep.blockingTask?.title}</span>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            {dep.blockingTask?.status}
                          </span>
                          <button
                            onClick={() => void handleRemoveDependency(task.id, dep.id)}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Subtasks list */}
                {totalSubtasks > 0 && (
                  <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[11px] text-slate-600 uppercase tracking-wider">
                        Subtasks ({completedSubtasks}/{totalSubtasks})
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${subtaskPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{subtaskPercent}%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 pl-1 border-l-2 border-slate-200">
                      {task.subtasks!.map((st) => (
                        <div key={st.id} className="flex items-center justify-between gap-2 text-slate-700">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void handleToggleSubtask(st.id, st.status)}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                st.status === 'DONE'
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 hover:border-blue-500 bg-white'
                              }`}
                              title={st.status === 'DONE' ? 'Mark subtask todo' : 'Complete subtask'}
                            >
                              {st.status === 'DONE' && (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <span className={st.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                              {st.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{st.estimateMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveParentTask(task)}
                      className="text-blue-600 hover:text-blue-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      + Add Subtask
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => setActiveDepTask(task)}
                      className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      + Add Blocker
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => handleOpenLogTime(task)}
                      className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Log execution minutes"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Log Time</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={() => handleOpenEditTask(task)}
                      className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Edit task"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {task.status !== 'DONE' && task.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => void handleStart(task.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => void handleBlock(task.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-colors cursor-pointer"
                      >
                        Block
                      </button>
                    )}
                    {task.status !== 'DONE' ? (
                      <button
                        onClick={() => void handleComplete(task.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                    ) : (
                      <button
                        onClick={() => void handleReopen(task.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 transition-colors cursor-pointer"
                      >
                        Reopen
                      </button>
                    )}
                    {task.status !== 'CANCELLED' && (
                      <button
                        onClick={() => void handleCancel(task.id)}
                        className="text-slate-500 hover:text-red-500 text-[11px] font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         CREATE TASK MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Executable Task</h3>
                {createInitialStatus && (
                  <p className="text-[11px] text-slate-500">
                    Will be created in column: <strong className="text-blue-600">{createInitialStatus}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateTask(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement refresh token rotation middleware"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project *
                  </label>
                  <select
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Milestone (Optional)
                  </label>
                  <select
                    value={milestoneId}
                    onChange={(e) => setMilestoneId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">No Milestone</option>
                    {filteredMilestonesForProject.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed criteria, design references, constraints..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Est. (Minutes)
                  </label>
                  <input
                    type="number"
                    value={estimateMinutes}
                    onChange={(e) => setEstimateMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
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
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         CREATE SUBTASK MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeParentTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add Subtask to: <span className="text-blue-600">{activeParentTask.title}</span>
            </h3>

            <form onSubmit={(e) => void handleCreateSubtask(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtask Title *
                </label>
                <input
                  type="text"
                  required
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  placeholder="e.g. Write unit test assertions"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimate (Minutes)
                </label>
                <input
                  type="number"
                  value={subtaskEstimate}
                  onChange={(e) => setSubtaskEstimate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveParentTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Save Subtask
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         ADD DEPENDENCY / BLOCKER MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeDepTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add Blocker for: <span className="text-rose-600">{activeDepTask.title}</span>
            </h3>

            <p className="text-xs text-slate-500">
              Select a task that must be marked DONE before this task can become unblocked.
            </p>

            <form onSubmit={(e) => void handleAddDependency(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blocking Task *
                </label>
                <select
                  required
                  value={blockingTaskId}
                  onChange={(e) => setBlockingTaskId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a task that blocks this one...</option>
                  {tasks
                    .filter((t) => t.id !== activeDepTask.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.status}] {t.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveDepTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!blockingTaskId}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Add Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         EDIT TASK MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Task</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateTaskSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project *</label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Milestone</label>
                  <select
                    value={editMilestoneId}
                    onChange={(e) => setEditMilestoneId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">No Milestone</option>
                    {milestones
                      .filter((m) => !editProjectId || m.projectId === editProjectId)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
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
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="BACKLOG">Backlog</option>
                    <option value="READY">Ready</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. (Min)</label>
                  <input
                    type="number"
                    value={editEstimateMinutes}
                    onChange={(e) => setEditEstimateMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Actual (Min)</label>
                  <input
                    type="number"
                    value={editActualMinutes}
                    onChange={(e) => setEditActualMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  disabled={isUpdatingTask}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTask}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
         LOG TIME MODAL
         ══════════════════════════════════════════════════════════════════════════ */}
      {loggingTimeTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Log Execution Time</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{loggingTimeTask.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setLoggingTimeTask(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleLogTimeSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Spent (Minutes) *</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={logTimeMinutes}
                  onChange={(e) => setLogTimeMinutes(e.target.value)}
                  disabled={isLoggingTime}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                />
                <div className="flex gap-2 mt-2">
                  {[15, 30, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLogTimeMinutes(String(m))}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 rounded-lg cursor-pointer"
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 space-y-1">
                <div className="flex justify-between">
                  <span>Current Actual:</span>
                  <strong>{loggingTimeTask.actualMinutes || 0}m</strong>
                </div>
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>New Total:</span>
                  <strong>{(loggingTimeTask.actualMinutes || 0) + (parseInt(logTimeMinutes, 10) || 0)}m</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLoggingTimeTask(null)}
                  disabled={isLoggingTime}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingTime}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isLoggingTime ? 'Logging...' : 'Confirm Log Time'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
