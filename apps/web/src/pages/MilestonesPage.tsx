import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MilestoneDto, MilestoneStatus, ProjectDto } from '@kenenisa-os/shared';
import {
  fetchMilestones,
  createMilestone,
  updateMilestone,
  completeMilestone,
  reopenMilestone,
  reorderMilestones,
} from '../features/milestones/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { useToast } from '../components/ui/Toast.js';

const MILESTONE_BOARD_COLUMNS: {
  status: MilestoneStatus;
  label: string;
  dotColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
}[] = [
  {
    status: 'UPCOMING',
    label: 'Upcoming',
    dotColor: 'bg-slate-400',
    bgBadge: 'bg-slate-50',
    textBadge: 'text-slate-700',
    borderBadge: 'border-slate-200',
  },
  {
    status: 'IN_PROGRESS',
    label: 'In Flight',
    dotColor: 'bg-purple-600',
    bgBadge: 'bg-purple-50',
    textBadge: 'text-purple-700',
    borderBadge: 'border-purple-200',
  },
  {
    status: 'REACHED',
    label: 'Reached',
    dotColor: 'bg-emerald-600',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
  },
  {
    status: 'DELAYED',
    label: 'Delayed',
    dotColor: 'bg-rose-500',
    bgBadge: 'bg-rose-50',
    textBadge: 'text-rose-700',
    borderBadge: 'border-rose-200',
  },
];

export const MilestonesPage: React.FC = () => {
  const { showToast } = useToast();
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Timeline Order vs Notion Checkpoint Board
  const [viewMode, setViewMode] = useState<'timeline' | 'board'>(() => {
    return (localStorage.getItem('kenenisa_milestones_view_mode') as 'timeline' | 'board') || 'timeline';
  });

  const handleSetViewMode = (mode: 'timeline' | 'board') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_milestones_view_mode', mode);
  };

  // Filters
  const [projectIdFilter, setProjectIdFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [createInitialStatus, setCreateInitialStatus] = useState<MilestoneStatus>('UPCOMING');
  const [submitting, setSubmitting] = useState(false);

  // Edit Milestone State
  const [editingMilestone, setEditingMilestone] = useState<MilestoneDto | null>(null);
  const [editMilestoneName, setEditMilestoneName] = useState('');
  const [editMilestoneProjectId, setEditMilestoneProjectId] = useState('');
  const [editMilestoneDescription, setEditMilestoneDescription] = useState('');
  const [editMilestoneTargetDate, setEditMilestoneTargetDate] = useState('');
  const [editMilestoneStatus, setEditMilestoneStatus] = useState<MilestoneStatus>('UPCOMING');
  const [isUpdatingMilestone, setIsUpdatingMilestone] = useState(false);

  const handleOpenEditMilestone = (m: MilestoneDto) => {
    setEditingMilestone(m);
    setEditMilestoneName(m.name);
    setEditMilestoneProjectId(m.projectId);
    setEditMilestoneDescription(m.description || '');
    setEditMilestoneTargetDate(m.targetDate ? m.targetDate.split('T')[0] : '');
    setEditMilestoneStatus(m.status);
  };

  const handleUpdateMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editMilestoneName.trim()) return;
    setIsUpdatingMilestone(true);
    try {
      await updateMilestone(editingMilestone.id, {
        name: editMilestoneName.trim(),
        projectId: editMilestoneProjectId,
        description: editMilestoneDescription.trim() || undefined,
        targetDate: editMilestoneTargetDate ? new Date(editMilestoneTargetDate).toISOString() : undefined,
        status: editMilestoneStatus,
      });
      showToast(`Milestone "${editMilestoneName.trim()}" updated successfully`, 'success');
      setEditingMilestone(null);
      await loadMilestones();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update milestone', 'error');
    } finally {
      setIsUpdatingMilestone(false);
    }
  };

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
      const created = await createMilestone({
        name: name.trim(),
        projectId,
        description: description.trim() || undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      if (createInitialStatus && createInitialStatus !== 'UPCOMING' && created?.id) {
        await updateMilestone(created.id, { status: createInitialStatus });
      }

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setTargetDate('');
      setCreateInitialStatus('UPCOMING');
      showToast('Milestone checkpoint created', 'success');
      await loadMilestones();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create milestone', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (milestone: MilestoneDto) => {
    try {
      if (milestone.status === 'REACHED') {
        await reopenMilestone(milestone.id);
        showToast('Milestone reopened to In Flight', 'info');
      } else {
        await completeMilestone(milestone.id);
        showToast('Milestone reached! Checkpoint marked achieved.', 'success');
      }
      await loadMilestones();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update milestone status', 'error');
    }
  };

  const handleQuickStatusChange = async (milestoneId: string, newStatus: MilestoneStatus) => {
    try {
      await updateMilestone(milestoneId, { status: newStatus });
      showToast(`Milestone status changed to ${newStatus.replace('_', ' ')}`, 'success');
      await loadMilestones();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to change milestone status', 'error');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const newMilestones = [...milestones];
    const temp = newMilestones[index];
    newMilestones[index] = newMilestones[targetIndex];
    newMilestones[targetIndex] = temp;

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

  // Group milestones by status for Checkpoint Board
  const milestonesByStatus = useMemo(() => {
    const map: Record<MilestoneStatus, MilestoneDto[]> = {
      UPCOMING: [],
      IN_PROGRESS: [],
      REACHED: [],
      DELAYED: [],
    };
    milestones.forEach((m) => {
      if (map[m.status]) {
        map[m.status].push(m);
      } else {
        map.UPCOMING.push(m);
      }
    });
    return map;
  }, [milestones]);

  const openCreateForStatus = (st: MilestoneStatus) => {
    setCreateInitialStatus(st);
    setIsCreateOpen(true);
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
            Key checkpoints marking major project stage completion and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSetViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-purple-700 shadow-2xs border border-purple-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Switch to Timeline Order"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Timeline Order</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white text-purple-700 shadow-2xs border border-purple-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Switch to Notion-Style Checkpoint Board"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>Checkpoint Board</span>
            </button>
          </div>

          <button
            id="create-milestone-btn"
            onClick={() => {
              setCreateInitialStatus('UPCOMING');
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search milestones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={projectIdFilter}
            onChange={(e) => setProjectIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
              </option>
            ))}
          </select>

          {(search || projectIdFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setProjectIdFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto text-purple-600">
            🎯
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No milestones found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create major checkpoints to mark key progress stages for your projects.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE CHECKPOINT BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-6">
          {MILESTONE_BOARD_COLUMNS.map((col) => {
            const colMilestones = milestonesByStatus[col.status] || [];

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
                      {colMilestones.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateForStatus(col.status)}
                    className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                    title={`Add milestone to ${col.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colMilestones.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No milestones in {col.label.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.status)}
                        className="mt-2 text-[11px] font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        + Add Milestone
                      </button>
                    </div>
                  ) : (
                    colMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[150px]">
                            {m.project?.name || 'Project'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditMilestone(m)}
                            className="p-1 rounded text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Edit milestone"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{m.name}</h4>
                          {m.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                              {m.description}
                            </p>
                          )}
                        </div>

                        {m.targetDate && (
                          <div className="text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span>Target Checkpoint:</span>
                            <span className="font-mono text-purple-700 font-bold">
                              {m.targetDate.split('T')[0]}
                            </span>
                          </div>
                        )}

                        {/* Quick Mover */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            {m.status !== 'IN_PROGRESS' && (
                              <button
                                type="button"
                                onClick={() => void handleQuickStatusChange(m.id, 'IN_PROGRESS')}
                                className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold transition-colors cursor-pointer"
                              >
                                In Flight
                              </button>
                            )}
                            {m.status !== 'REACHED' ? (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(m)}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                              >
                                ✓ Reach
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(m)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditMilestone(m)}
                            className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer"
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
           TIMELINE ORDER LIST VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="space-y-3">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs hover:border-purple-200 transition-all"
            >
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => void handleMove(idx, 'up')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 text-[10px] cursor-pointer"
                    title="Move up in order"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === milestones.length - 1}
                    onClick={() => void handleMove(idx, 'down')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 text-[10px] cursor-pointer"
                    title="Move down in order"
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

                  <h3 className="text-sm font-semibold text-slate-900 truncate">{m.name}</h3>
                  {m.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{m.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {m.targetDate && (
                  <span className="text-xs font-mono text-slate-500">
                    Target: {m.targetDate.split('T')[0]}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditMilestone(m)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => void handleToggleComplete(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      m.status === 'REACHED'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold'
                    }`}
                  >
                    {m.status === 'REACHED' ? 'Reopen' : 'Mark Reached'}
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
                <h3 className="text-base font-bold text-slate-900">Create Milestone</h3>
                {createInitialStatus && (
                  <p className="text-[11px] text-slate-500">
                    Status: <strong className="text-purple-600">{createInitialStatus}</strong>
                  </p>
                )}
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project *</label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alpha API Endpoints Shipped"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Criteria defining this checkpoint..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                />
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Milestone</h3>
              <button
                type="button"
                onClick={() => setEditingMilestone(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateMilestoneSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project *</label>
                <select
                  required
                  value={editMilestoneProjectId}
                  onChange={(e) => setEditMilestoneProjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Name *</label>
                <input
                  type="text"
                  required
                  value={editMilestoneName}
                  onChange={(e) => setEditMilestoneName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editMilestoneDescription}
                  onChange={(e) => setEditMilestoneDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editMilestoneStatus}
                    onChange={(e) => setEditMilestoneStatus(e.target.value as MilestoneStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="IN_PROGRESS">In Flight</option>
                    <option value="REACHED">Reached</option>
                    <option value="DELAYED">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={editMilestoneTargetDate}
                    onChange={(e) => setEditMilestoneTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  disabled={isUpdatingMilestone}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingMilestone}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingMilestone ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
