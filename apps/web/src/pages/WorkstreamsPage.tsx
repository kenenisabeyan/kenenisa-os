import React, { useState, useEffect, useCallback } from 'react';
import { WorkstreamDto, WorkstreamStatus } from '@kenenisa-os/shared';
import { fetchWorkstreams, createWorkstream, archiveWorkstream } from '../features/workstreams/api.js';

export const WorkstreamsPage: React.FC = () => {
  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkstreamStatus | ''>('ACTIVE');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priorityWeight, setPriorityWeight] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkstreams({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setWorkstreams(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading workstreams');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await createWorkstream({
        name: name.trim(),
        description: description.trim() || undefined,
        priorityWeight,
      });

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setPriorityWeight(5);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create workstream');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, wsName: string) => {
    if (!confirm(`Archive workstream "${wsName}"?`)) return;
    try {
      await archiveWorkstream(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive workstream');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
            Strategic Workstreams
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanent strategic areas of responsibility governing outcomes, projects & milestones.
          </p>
        </div>

        <button
          id="create-workstream-btn"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all duration-150 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Workstream
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search workstreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorkstreamStatus | '')}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          Loading workstreams...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-center space-y-3">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={() => void loadData()}
            className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : workstreams.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No workstreams found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create your first strategic workstream to organize goals and projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workstreams.map((ws) => (
            <div
              key={ws.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">{ws.name}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ws.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : ws.status === 'PAUSED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {ws.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ws.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-200">{ws._count?.goals || 0}</strong> Goals
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-200">{ws._count?.projects || 0}</strong> Projects
                  </span>
                </div>

                {ws.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => void handleArchive(ws.id, ws.name)}
                    className="text-slate-500 hover:text-red-400 font-semibold transition-colors"
                  >
                    Archive
                  </button>
                )}
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
              <h3 className="text-base font-bold text-white">Create Strategic Workstream</h3>
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
                  Workstream Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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
                  placeholder="Strategic purpose and core focus area..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority Weight (1 - 10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
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
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Workstream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
