import React, { useState, useEffect, useCallback } from 'react';
import { WorkstreamDto, WorkstreamStatus } from '@kenenisa-os/shared';
import { fetchWorkstreams, createWorkstream, archiveWorkstream } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';

export const WorkstreamsPage: React.FC = () => {
  const { showToast } = useToast();
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
      setError(err instanceof Error ? err.message : 'Failed to load workstreams');
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
      showToast('Workstream created successfully', 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create workstream', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, wsName: string) => {
    if (!confirm(`Archive workstream "${wsName}"?`)) return;
    try {
      await archiveWorkstream(id);
      showToast(`Workstream "${wsName}" archived`, 'info');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to archive workstream', 'error');
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
            className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Workstream
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search workstreams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 font-medium"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-2">
          <span className="text-xs text-slate-600 font-bold shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as WorkstreamStatus | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#6366F1]"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {workstreams.map((ws) => (
            <div
              key={ws.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">{ws.name}</h2>
                  <Badge variant={ws.status} />
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {ws.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-800 font-bold">{ws._count?.goals || 0}</strong> Goals
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800 font-bold">{ws._count?.projects || 0}</strong> Projects
                  </span>
                </div>

                {ws.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => void handleArchive(ws.id, ws.name)}
                    className="text-slate-500 hover:text-rose-600 font-bold transition-colors py-1 px-2"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Strategic Workstream</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workstream Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Engineering"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Strategic purpose and core focus area..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority Weight (1 - 10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#6366F1]"
                />
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
