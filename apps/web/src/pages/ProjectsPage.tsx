import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDto, ProjectStatus, TaskPriority, WorkstreamDto, GoalDto } from '@kenenisa-os/shared';
import { fetchProjects, createProject, completeProject, reopenProject, archiveProject } from '../features/projects/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { Badge } from '../components/ui/Badge.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';

export const ProjectsPage: React.FC = () => {
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
      await loadProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (project: ProjectDto) => {
    try {
      if (project.status === 'COMPLETED') {
        await reopenProject(project.id);
      } else {
        await completeProject(project.id);
      }
      await loadProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update project status');
    }
  };

  const handleArchive = async (id: string, projectName: string) => {
    if (!confirm(`Archive project "${projectName}"?`)) return;
    try {
      await archiveProject(id);
      await loadProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive project');
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 min-w-[200px]"
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={workstreamIdFilter}
            onChange={(e) => setWorkstreamIdFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
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
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {p.workstream?.name || 'Workstream'}
                    </span>
                    <h2 className="text-sm font-bold text-white tracking-tight">{p.name}</h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={p.priority} />
                    <Badge variant={p.status} />
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span>
                    Tasks: <strong className="text-slate-200">{p._count?.tasks || 0}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Milestones: <strong className="text-slate-200">{p._count?.milestones || 0}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleToggleComplete(p)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    {p.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                  </button>
                  {p.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => void handleArchive(p.id, p.name)}
                      className="text-slate-500 hover:text-rose-400 font-semibold"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Project</h3>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {workstreams.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal (Optional)</label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kenenisa OS Production Hardening"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project scope and success metrics..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
