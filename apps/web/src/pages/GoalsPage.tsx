import React, { useState, useEffect, useCallback } from 'react';
import { GoalDto, GoalStatus, TaskPriority, WorkstreamDto } from '@kenenisa-os/shared';
import { fetchGoals, createGoal, completeGoal, reopenGoal } from '../features/goals/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';

export const GoalsPage: React.FC = () => {
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
      await loadGoals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal: GoalDto) => {
    try {
      if (goal.status === 'ACHIEVED') {
        await reopenGoal(goal.id);
      } else {
        await completeGoal(goal.id);
      }
      await loadGoals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update goal status');
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-w-[200px]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={workstreamIdFilter}
            onChange={(e) => setWorkstreamIdFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      {g.workstream?.name || 'Workstream'}
                    </span>
                    <h2 className="text-sm font-bold text-white tracking-tight">{g.title}</h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={g.priority} />
                    <Badge variant={g.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {g.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Projects: <strong className="text-slate-200">{g._count?.projects || 0}</strong>
                </span>

                <button
                  onClick={() => void handleToggleComplete(g)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    g.status === 'ACHIEVED'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {g.status === 'ACHIEVED' ? 'Reopen Goal' : 'Mark Achieved'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Strategic Goal</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workstream *</label>
                <select
                  required
                  value={workstreamId}
                  onChange={(e) => setWorkstreamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Monorepo Architecture"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-level description of success criteria..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
