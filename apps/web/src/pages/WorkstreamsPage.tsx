import React, { useState, useEffect, useCallback } from 'react';
import { WorkstreamDto, WorkstreamStatus } from '@kenenisa-os/shared';
import { fetchWorkstreams, createWorkstream, archiveWorkstream } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';

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
      <PageHeader
        title="Strategic Workstreams"
        description="Permanent strategic areas of responsibility governing outcomes, projects, and milestones."
        breadcrumbs={[{ label: 'Build' }, { label: 'Workstreams' }]}
        actions={
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
        }
      />

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

      {/* Content States */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : workstreams.length === 0 ? (
        <EmptyStateCard
          title="No workstreams found"
          description="Create your first strategic workstream to organize goals and projects."
          actionLabel="Create Workstream"
          onAction={() => setIsCreateOpen(true)}
        />
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
                  <Badge variant={ws.status} />
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
                    className="text-slate-500 hover:text-rose-400 font-semibold transition-colors"
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
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Workstream Name *</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Strategic purpose and core focus area..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Weight (1 - 10)</label>
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
