import React, { useState, useEffect, useCallback } from 'react';
import { MilestoneDto, ProjectDto } from '@kenenisa-os/shared';
import {
  fetchMilestones,
  createMilestone,
  completeMilestone,
  reopenMilestone,
  reorderMilestones,
} from '../features/milestones/api.js';
import { fetchProjects } from '../features/projects/api.js';

export const MilestonesPage: React.FC = () => {
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects({ pageSize: 100 });
      setProjects(data);
      if (data.length > 0 && !projectId) {
        setProjectId(data[0].id);
      }
    } catch {
      // Ignore error silently
    }
  }, [projectId]);

  const loadMilestones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMilestones({
        projectId: projectIdFilter || undefined,
        search: search || undefined,
      });
      setMilestones(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading milestones');
    } finally {
      setLoading(false);
    }
  }, [projectIdFilter, search]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    void loadMilestones();
  }, [loadMilestones]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    setSubmitting(true);
    try {
      await createMilestone({
        name: name.trim(),
        projectId,
        description: description.trim() || undefined,
        sortOrder: milestones.length + 1,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setTargetDate('');
      await loadMilestones();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create milestone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (m: MilestoneDto) => {
    try {
      if (m.status === 'REACHED') {
        await reopenMilestone(m.id);
      } else {
        await completeMilestone(m.id);
      }
      await loadMilestones();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update milestone status');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const newMilestones = [...milestones];
    const temp = newMilestones[index];
    newMilestones[index] = newMilestones[targetIndex];
    newMilestones[targetIndex] = temp;

    // Assign new sortOrders
    const reorderPayload = newMilestones.map((m, idx) => ({
      id: m.id,
      sortOrder: idx + 1,
    }));

    setMilestones(newMilestones);

    try {
      await reorderMilestones(reorderPayload);
    } catch {
      await loadMilestones();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></span>
            Project Milestones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Key checkpoints marking major project stage completion.
          </p>
        </div>

        <button
          id="create-milestone-btn"
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Milestone
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          placeholder="Search milestones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
        />

        <div className="flex items-center gap-2">
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Loading milestones...
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => void loadMilestones()}
            className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : milestones.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No milestones found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create major checkpoints to mark key progress stages for your projects.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => void handleMove(idx, 'up')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 text-[10px]"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === milestones.length - 1}
                    onClick={() => void handleMove(idx, 'down')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 text-[10px]"
                  >
                    ▼
                  </button>
                </div>

                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 truncate">
                      {m.project?.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        m.status === 'REACHED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'IN_PROGRESS'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h2
                    className={`text-sm font-bold break-words ${
                      m.status === 'REACHED' ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {m.name}
                  </h2>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 justify-between sm:justify-end">
                <div className="text-left sm:text-right text-[11px] text-slate-500">
                  Target:{' '}
                  <span className="text-slate-800 font-medium">
                    {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <button
                  onClick={() => void handleToggleComplete(m)}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                    m.status === 'REACHED'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  {m.status === 'REACHED' ? 'Reopen' : 'Reach Milestone'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Project Milestone</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project *
                </label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Milestone Checkpoint Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Authentication Infrastructure Complete"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Stage completion criteria..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
