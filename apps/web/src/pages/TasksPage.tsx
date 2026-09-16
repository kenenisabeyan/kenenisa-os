import React, { useState, useEffect, useCallback } from 'react';
import { TaskDto, TaskStatus, TaskPriority, ProjectDto, MilestoneDto } from '@kenenisa-os/shared';
import {
  fetchTasks,
  createTask,
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

export const TasksPage: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [submitting, setSubmitting] = useState(false);

  // Subtask Modal
  const [activeParentTask, setActiveParentTask] = useState<TaskDto | null>(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskEstimate, setSubtaskEstimate] = useState('30');

  // Dependency Modal
  const [activeDepTask, setActiveDepTask] = useState<TaskDto | null>(null);
  const [blockingTaskId, setBlockingTaskId] = useState('');

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
      await createTask({
        title: title.trim(),
        projectId,
        milestoneId: milestoneId || undefined,
        description: description.trim() || undefined,
        priority,
        estimateMinutes: parseInt(estimateMinutes, 10) || 0,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setMilestoneId('');
      setDueDate('');
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


  const filteredMilestonesForProject = milestones.filter(
    (m) => !projectId || m.projectId === projectId,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executable Task Engine"
        description="Deterministic units of execution with subtasks, blockers, and readiness state."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Tasks' }]}
        actions={
          <button
            id="create-task-btn"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] font-medium min-w-[200px]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6366F1]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6366F1]"
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
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6366F1]"
          >
            <option value="">All Priorities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-24" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadTasks()} />
      ) : tasks.length === 0 ? (
        <EmptyStateCard
          title="No tasks found"
          description="Create an executable task to start building out project action items and dependencies."
          actionLabel="Create Task"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 hover:border-slate-300 transition-all space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                      {task.project?.name}
                    </span>
                    {task.milestone && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#7e22ce] border border-purple-200">
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
                          ? 'bg-sky-50 text-[#0284c7] border border-sky-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.status === 'READY'
                          ? 'bg-emerald-50 text-[#15803d] border border-emerald-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-[#1d4ed8] border border-blue-200'
                          : task.status === 'BLOCKED'
                          ? 'bg-amber-50 text-[#c2410c] border border-amber-200'
                          : task.status === 'DONE'
                          ? 'bg-slate-100 text-slate-500 line-through'
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
                    <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                  )}
                </div>

                {/* Estimate & Time */}
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>Est: <strong className="text-slate-200">{task.estimateMinutes}m</strong></div>
                  {task.dueDate && (
                    <div className="text-slate-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Blockers list if any */}
              {task.blockingDependencies && task.blockingDependencies.length > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-2.5 text-xs text-rose-300 space-y-1">
                  <div className="font-semibold text-[11px] text-rose-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Blocked By:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.blockingDependencies.map((dep) => (
                      <div
                        key={dep.id}
                        className="bg-rose-900/40 border border-rose-800/50 px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5 text-rose-200"
                      >
                        <span>{dep.blockingTask?.title}</span>
                        <span className="text-[9px] uppercase font-bold px-1 rounded bg-slate-950">
                          {dep.blockingTask?.status}
                        </span>
                        <button
                          onClick={() => void handleRemoveDependency(task.id, dep.id)}
                          className="text-rose-400 hover:text-white font-bold ml-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks list if any */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="bg-slate-950/50 border border-slate-800/60 rounded-lg p-2.5 space-y-1 text-xs">
                  <div className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
                    Subtasks ({task.subtasks.filter((s) => s.status === 'DONE').length}/
                    {task.subtasks.length})
                  </div>
                  <div className="space-y-1 pl-2 border-l-2 border-slate-800">
                    {task.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center justify-between text-slate-300">
                        <span className={st.status === 'DONE' ? 'line-through text-slate-500' : ''}>
                          {st.title}
                        </span>
                        <span className="text-[10px] text-slate-500">{st.estimateMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Actions Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveParentTask(task)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    + Add Subtask
                  </button>
                  <span className="text-slate-700">•</span>
                  <button
                    onClick={() => setActiveDepTask(task)}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1"
                  >
                    + Add Blocker
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {task.status !== 'DONE' && task.status !== 'IN_PROGRESS' && (
                    <button
                      onClick={() => void handleStart(task.id)}
                      className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30"
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => void handleBlock(task.id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-[11px] border border-rose-500/30"
                    >
                      Block
                    </button>
                  )}
                  {task.status !== 'DONE' ? (
                    <button
                      onClick={() => void handleComplete(task.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30"
                    >
                      Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => void handleReopen(task.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px]"
                    >
                      Reopen
                    </button>
                  )}
                  {task.status !== 'CANCELLED' && (
                    <button
                      onClick={() => void handleCancel(task.id)}
                      className="text-slate-500 hover:text-red-400 text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Executable Task</h3>
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
                  Project *
                </label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setMilestoneId('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="">No Milestone</option>
                  {filteredMilestonesForProject.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement authentication middleware"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical details or acceptance criteria..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimate (min)
                  </label>
                  <input
                    type="number"
                    value={estimateMinutes}
                    onChange={(e) => setEstimateMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold text-white shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subtask Modal */}
      {activeParentTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add Subtask to: <span className="text-[#2563eb]">{activeParentTask.title}</span>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveParentTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold text-white shadow-xs"
                >
                  Save Subtask
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Blocker Dependency Modal */}
      {activeDepTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add Blocker Task for: <span className="text-rose-600">{activeDepTask.title}</span>
            </h3>

            <form onSubmit={(e) => void handleAddDependency(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Blocker Task *
                </label>
                <select
                  required
                  value={blockingTaskId}
                  onChange={(e) => setBlockingTaskId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                >
                  <option value="">Choose task that blocks this one...</option>
                  {tasks
                    .filter((t) => t.id !== activeDepTask.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.status})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveDepTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs"
                >
                  Add Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
