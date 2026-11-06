import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ProjectDto, ProjectStatus, TaskPriority, WorkstreamDto, GoalDto } from '@kenenisa-os/shared';
import { fetchProjects, createProject, updateProject, completeProject, reopenProject, archiveProject } from '../features/projects/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

const PROJECT_BOARD_COLUMNS: {
  status: ProjectStatus;
  label: string;
  dotColor: string;
  bgBadge: string;
  textBadge: string;
  borderBadge: string;
}[] = [
  {
    status: 'PLANNED',
    label: 'Planned',
    dotColor: 'bg-sky-500',
    bgBadge: 'bg-sky-50',
    textBadge: 'text-sky-700',
    borderBadge: 'border-sky-200',
  },
  {
    status: 'ACTIVE',
    label: 'Active Build',
    dotColor: 'bg-blue-600',
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-700',
    borderBadge: 'border-blue-200',
  },
  {
    status: 'ON_HOLD',
    label: 'On Hold',
    dotColor: 'bg-amber-500',
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-700',
    borderBadge: 'border-amber-200',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    dotColor: 'bg-emerald-600',
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderBadge: 'border-emerald-200',
  },
];

export const ProjectsPage: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectDto[]>(
    () => getCachedApiData<ProjectDto[]>('/api/v1/projects') || [],
  );
  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [loading, setLoading] = useState(() => !getCachedApiData<ProjectDto[]>('/api/v1/projects'));
  const [error, setError] = useState<string | null>(null);

  // View Mode: Grid Gallery vs Notion Status Board
  const [viewMode, setViewMode] = useState<'grid' | 'board'>(() => {
    return (localStorage.getItem('kenenisa_projects_view_mode') as 'grid' | 'board') || 'grid';
  });

  const handleSetViewMode = (mode: 'grid' | 'board') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_projects_view_mode', mode);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [workstreamIdFilter, setWorkstreamIdFilter] = useState('');
  const [goalIdFilter, setGoalIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [workstreamId, setWorkstreamId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [targetDate, setTargetDate] = useState('');
  const [createInitialStatus, setCreateInitialStatus] = useState<ProjectStatus>('PLANNED');
  const [submitting, setSubmitting] = useState(false);

  // Edit Project State
  const [editingProject, setEditingProject] = useState<ProjectDto | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectWorkstreamId, setEditProjectWorkstreamId] = useState('');
  const [editProjectGoalId, setEditProjectGoalId] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectPriority, setEditProjectPriority] = useState<TaskPriority>('P2');
  const [editProjectTargetDate, setEditProjectTargetDate] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<ProjectStatus>('PLANNED');
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  const handleOpenEditProject = (p: ProjectDto) => {
    setEditingProject(p);
    setEditProjectName(p.name);
    setEditProjectWorkstreamId(p.workstreamId);
    setEditProjectGoalId(p.goalId || '');
    setEditProjectDescription(p.description || '');
    setEditProjectPriority(p.priority);
    setEditProjectTargetDate(p.targetDate ? p.targetDate.split('T')[0] : '');
    setEditProjectStatus(p.status);
  };

  const handleUpdateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editProjectName.trim()) return;
    setIsUpdatingProject(true);
    try {
      await updateProject(editingProject.id, {
        name: editProjectName.trim(),
        workstreamId: editProjectWorkstreamId,
        goalId: editProjectGoalId ? editProjectGoalId : null,
        description: editProjectDescription.trim() || null,
        priority: editProjectPriority,
        targetDate: editProjectTargetDate ? new Date(editProjectTargetDate).toISOString() : null,
        status: editProjectStatus,
      });
      showToast(`Project "${editProjectName.trim()}" updated successfully`, 'success');
      setEditingProject(null);
      await loadProjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update project', 'error');
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const loadDependencies = useCallback(async () => {
    try {
      const [wsData, goalData] = await Promise.all([
        fetchWorkstreams({ pageSize: 100 }),
        fetchGoals({ pageSize: 100 }),
      ]);
      setWorkstreams(wsData);
      if (wsData.length > 0 && !workstreamId) {
        setWorkstreamId(wsData[0].id);
      }
      setGoals(goalData);
    } catch {
      // Ignore errors silently
    }
  }, [workstreamId]);

  const loadProjects = useCallback(async () => {
    if (projects.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchProjects({
        search: search || undefined,
        workstreamId: workstreamIdFilter || undefined,
        goalId: goalIdFilter || undefined,
        status: statusFilter || undefined,
      });
      setProjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred loading projects');
    } finally {
      setLoading(false);
    }
  }, [projects.length, search, workstreamIdFilter, goalIdFilter, statusFilter]);

  useEffect(() => {
    void loadDependencies();
  }, [loadDependencies]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workstreamId) return;

    setSubmitting(true);
    try {
      const created = await createProject({
        name: name.trim(),
        workstreamId,
        goalId: goalId || undefined,
        description: description.trim() || undefined,
        priority,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      if (createInitialStatus && createInitialStatus !== 'PLANNED' && created?.id) {
        await updateProject(created.id, { status: createInitialStatus });
      }

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setGoalId('');
      setTargetDate('');
      setCreateInitialStatus('PLANNED');
      showToast('Project created successfully', 'success');
      await loadProjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (project: ProjectDto) => {
    try {
      if (project.status === 'COMPLETED') {
        await reopenProject(project.id);
        showToast('Project reopened', 'info');
      } else {
        await completeProject(project.id);
        showToast('Project marked as completed!', 'success');
      }
      await loadProjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update project status', 'error');
    }
  };

  const handleQuickStatusChange = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
      showToast(`Project moved to ${newStatus.replace('_', ' ')}`, 'success');
      await loadProjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to move project', 'error');
    }
  };

  const handleArchive = async (id: string, projectName: string) => {
    if (!confirm(`Archive project "${projectName}"?`)) return;
    try {
      await archiveProject(id);
      showToast('Project archived', 'info');
      await loadProjects();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to archive project', 'error');
    }
  };

  // Group projects by status for Board View
  const projectsByStatus = useMemo(() => {
    const map: Record<ProjectStatus, ProjectDto[]> = {
      PLANNED: [],
      ACTIVE: [],
      ON_HOLD: [],
      COMPLETED: [],
      ARCHIVED: [],
    };
    projects.forEach((p) => {
      if (map[p.status]) {
        map[p.status].push(p);
      } else {
        map.PLANNED.push(p);
      }
    });
    return map;
  }, [projects]);

  const openCreateForStatus = (st: ProjectStatus) => {
    setCreateInitialStatus(st);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Initiatives"
        description="Focused multi-step engineering and career projects moving strategic goals forward."
        breadcrumbs={[{ label: 'Build' }, { label: 'Projects' }]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* View Switcher: Grid vs Status Board */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Grid Gallery View"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Grid Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
                title="Switch to Notion-Style Status Board"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>Status Board</span>
              </button>
            </div>

            <button
              id="create-project-btn"
              onClick={() => {
                setCreateInitialStatus('PLANNED');
                setIsCreateOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Project</span>
            </button>
          </div>
        }
      />

      <PageAiCopilot pageType="projects" entityTitle={projects[0]?.name} />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={workstreamIdFilter}
            onChange={(e) => setWorkstreamIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories / Workstreams</option>
            {workstreams.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select
            value={goalIdFilter}
            onChange={(e) => setGoalIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Goals</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | '')}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active Build</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {(search || workstreamIdFilter || goalIdFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setWorkstreamIdFilter('');
                setGoalIdFilter('');
                setStatusFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content States */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-32" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadProjects()} />
      ) : projects.length === 0 ? (
        <EmptyStateCard
          title="No projects found"
          description="Create your first project to turn high-level goals into executable tasks."
          actionLabel="Create Project"
          onAction={() => {
            setCreateInitialStatus('PLANNED');
            setIsCreateOpen(true);
          }}
        />
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE PROJECT STATUS BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-6">
          {PROJECT_BOARD_COLUMNS.map((col) => {
            const colProjects = projectsByStatus[col.status] || [];
            const totalTasks = colProjects.reduce((sum, p) => sum + (p._count?.tasks || 0), 0);

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
                      {colProjects.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateForStatus(col.status)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title={`Add project to ${col.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{colProjects.length} initiative(s)</span>
                  <span>{totalTasks} total tasks</span>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colProjects.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No projects in {col.label.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.status)}
                        className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        + Add Project
                      </button>
                    </div>
                  ) : (
                    colProjects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 truncate max-w-[140px]">
                              {p.workstream?.name || 'Category'}
                            </span>
                            <Badge variant={p.priority} />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditProject(p)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit project"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{p.name}</h4>
                          {p.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                              {p.description}
                            </p>
                          )}
                        </div>

                        {p.goal && (
                          <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-200/70 rounded-md px-2 py-0.5 truncate">
                            🎯 {p.goal.title}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <span><strong className="text-slate-800">{p._count?.tasks || 0}</strong> tasks</span>
                            <span>&bull;</span>
                            <span><strong className="text-slate-800">{p._count?.milestones || 0}</strong> ms</span>
                          </div>
                          {p.targetDate && (
                            <span className="font-mono text-[10px] text-slate-500">
                              {p.targetDate.split('T')[0]}
                            </span>
                          )}
                        </div>

                        {/* Notion-style Status Mover */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            {p.status !== 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => void handleQuickStatusChange(p.id, 'ACTIVE')}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                              >
                                Active
                              </button>
                            )}
                            {p.status !== 'ON_HOLD' && (
                              <button
                                type="button"
                                onClick={() => void handleQuickStatusChange(p.id, 'ON_HOLD')}
                                className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold transition-colors cursor-pointer"
                              >
                                Hold
                              </button>
                            )}
                            {p.status !== 'COMPLETED' ? (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(p)}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                              >
                                Complete
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleToggleComplete(p)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => void handleArchive(p.id, p.name)}
                            className="text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                          >
                            Archive
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
           GRID GALLERY VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {p.workstream?.name || 'Category'}
                    </span>
                    <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{p.name}</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={p.priority} />
                    <Badge variant={p.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span>
                    Tasks: <strong className="text-slate-800">{p._count?.tasks || 0}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Milestones: <strong className="text-slate-800">{p._count?.milestones || 0}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditProject(p)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => void handleToggleComplete(p)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {p.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                  </button>
                  {p.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => void handleArchive(p.id, p.name)}
                      className="text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Archive
                    </button>
                  )}
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
                <h3 className="text-base font-bold text-slate-900">Create Project</h3>
                {createInitialStatus && (
                  <p className="text-[11px] text-slate-500">
                    Status: <strong className="text-blue-600">{createInitialStatus}</strong>
                  </p>
                )}
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workstream / Category *</label>
                <select
                  required
                  value={workstreamId}
                  onChange={(e) => setWorkstreamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal (Optional)</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">No parent goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kenenisa OS Production Hardening"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project scope and success metrics..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0">P0: Critical</option>
                    <option value="P1">P1: High</option>
                    <option value="P2">P2: Medium</option>
                    <option value="P3">P3: Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
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
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Project</h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateProjectSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Workstream / Category *</label>
                <select
                  required
                  value={editProjectWorkstreamId}
                  onChange={(e) => setEditProjectWorkstreamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal (Optional)</label>
                <select
                  value={editProjectGoalId}
                  onChange={(e) => setEditProjectGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">No parent goal</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editProjectPriority}
                    onChange={(e) => setEditProjectPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="P0">P0: Critical</option>
                    <option value="P1">P1: High</option>
                    <option value="P2">P2: Medium</option>
                    <option value="P3">P3: Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editProjectStatus}
                    onChange={(e) => setEditProjectStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="ACTIVE">Active Build</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                <input
                  type="date"
                  value={editProjectTargetDate}
                  onChange={(e) => setEditProjectTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  disabled={isUpdatingProject}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProject}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingProject ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
