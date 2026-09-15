import React, { useState, useEffect, useCallback } from 'react';
import { GoalDto, GoalStatus, TaskPriority, WorkstreamDto } from '@kenenisa-os/shared';
import { fetchGoals, createGoal, completeGoal, reopenGoal } from '../features/goals/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            Strategic Goals
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Meaningful high-level outcomes to accomplish across workstreams.
          </p>
        </div>

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
      </div>

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

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading goals...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-center space-y-3">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={() => void loadGoals()}
            className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No goals found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create a strategic goal to guide concrete project execution.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-slate-700 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-cyan-400">
                    {g.workstream?.name || 'Workstream'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.priority === 'P0'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : g.priority === 'P1'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {g.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      g.status === 'ACHIEVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : g.status === 'IN_PROGRESS'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                <h2
                  className={`text-sm font-bold ${
                    g.status === 'ACHIEVED' ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  {g.title}
                </h2>

                {g.description && <p className="text-xs text-slate-400">{g.description}</p>}
              </div>

              <div className="flex items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <div className="text-right text-[11px] text-slate-400">
                  <div>
                    Target:{' '}
                    <span className="text-slate-200">
                      {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    Projects: <span className="text-slate-200">{g._count?.projects || 0}</span>
                  </div>
                </div>

                <button
                  onClick={() => void handleToggleComplete(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    g.status === 'ACHIEVED'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {g.status === 'ACHIEVED' ? 'Reopen' : 'Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Strategic Goal</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workstream *
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Monorepo Infrastructure"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed outcome description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
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
