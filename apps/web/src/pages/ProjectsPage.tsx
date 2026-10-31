import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDto, ProjectStatus, TaskPriority, WorkstreamDto, GoalDto } from '@kenenisa-os/shared';
import { fetchProjects, createProject, updateProject, completeProject, reopenProject, archiveProject } from '../features/projects/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';

export const ProjectsPage: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
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
  }, [search, workstreamIdFilter, goalIdFilter, statusFilter]);

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
      await createProject({
        name: name.trim(),
        workstreamId,
        goalId: goalId || undefined,
        description: description.trim() || undefined,
        priority,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      });

      setIsCreateOpen(false);
      setName('');
      setDescription('');
      setGoalId('');
      setTargetDate('');
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Initiatives"
        description="Focused multi-step engineering and career projects moving strategic goals forward."
        breadcrumbs={[{ label: 'Build' }, { label: 'Projects' }]}
        actions={
          <button
            id="create-project-btn"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          placeholder="Search projects..."
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
            value={goalIdFilter}
            onChange={(e) => setGoalIdFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ARCHIVED">Archived</option>
          </select>
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
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all duration-150 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {p.workstream?.name || 'Workstream'}
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
                      className="text-slate-400 hover:text-rose-600 font-medium"
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Project</h3>
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Goal (Optional)</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kenenisa OS Production Hardening"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project scope and success metrics..."
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
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Project Initiative</h3>
                <p className="text-xs text-slate-500">Update project category, goal alignment, or scope</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateProjectSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  disabled={isUpdatingProject}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Workstream *</label>
                  <select
                    required
                    value={editProjectWorkstreamId}
                    onChange={(e) => setEditProjectWorkstreamId(e.target.value)}
                    disabled={isUpdatingProject}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aligned Goal (Optional)</label>
                  <select
                    value={editProjectGoalId}
                    onChange={(e) => setEditProjectGoalId(e.target.value)}
                    disabled={isUpdatingProject}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Goal</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  disabled={isUpdatingProject}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editProjectPriority}
                    onChange={(e) => setEditProjectPriority(e.target.value as TaskPriority)}
                    disabled={isUpdatingProject}
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
                    value={editProjectStatus}
                    onChange={(e) => setEditProjectStatus(e.target.value as ProjectStatus)}
                    disabled={isUpdatingProject}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PLANNED">PLANNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={editProjectTargetDate}
                    onChange={(e) => setEditProjectTargetDate(e.target.value)}
                    disabled={isUpdatingProject}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  {isUpdatingProject ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
