import React, { useState, useEffect, useCallback } from 'react';
import { GoalDto, GoalStatus, TaskPriority, WorkstreamDto } from '@kenenisa-os/shared';
import { fetchGoals, createGoal, updateGoal, completeGoal, reopenGoal } from '../features/goals/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';

export const GoalsPage: React.FC = () => {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
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
  }, [search, workstreamIdFilter, statusFilter, priorityFilter]);

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
      await createGoal({
        title: title.trim(),
        workstreamId,
        description: description.trim() || undefined,
        priority,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      showToast('Strategic goal created', 'success');
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
        showToast('Goal reopened', 'info');
      } else {
        await completeGoal(goal.id);
        showToast('Goal marked as achieved!', 'success');
      }
      await loadGoals();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update goal status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategic Goals"
        description="Meaningful high-level outcomes to accomplish across workstreams."
        breadcrumbs={[{ label: 'Build' }, { label: 'Goals' }]}
        actions={
          <button
            id="create-goal-btn"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
        />

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={workstreamIdFilter}
            onChange={(e) => setWorkstreamIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Workstreams</option>
            {workstreams.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GoalStatus | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="P0">P0 - Critical</option>
            <option value="P1">P1 - High</option>
            <option value="P2">P2 - Medium</option>
            <option value="P3">P3 - Low</option>
          </select>
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
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {g.workstream?.name || 'Workstream'}
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
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Strategic Goal</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Workstream *</label>
                <select
                  required
                  value={workstreamId}
                  onChange={(e) => setWorkstreamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Monorepo Architecture"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-level description of success criteria..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Strategic Goal</h3>
                <p className="text-xs text-slate-500">Update goal target, focus area, or priority</p>
              </div>
              <button
                onClick={() => setEditingGoal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateGoalSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={editGoalTitle}
                  onChange={(e) => setEditGoalTitle(e.target.value)}
                  disabled={isUpdatingGoal}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category / Workstream *</label>
                <select
                  required
                  value={editGoalWorkstreamId}
                  onChange={(e) => setEditGoalWorkstreamId(e.target.value)}
                  disabled={isUpdatingGoal}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editGoalDescription}
                  onChange={(e) => setEditGoalDescription(e.target.value)}
                  disabled={isUpdatingGoal}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editGoalPriority}
                    onChange={(e) => setEditGoalPriority(e.target.value as TaskPriority)}
                    disabled={isUpdatingGoal}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
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
                    disabled={isUpdatingGoal}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ACHIEVED">ACHIEVED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={editGoalTargetDate}
                    onChange={(e) => setEditGoalTargetDate(e.target.value)}
                    disabled={isUpdatingGoal}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingGoal ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
