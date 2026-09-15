import React, { useState, useEffect, useCallback } from 'react';
import { ProjectDto, ProjectStatus, TaskPriority, WorkstreamDto, GoalDto } from '@kenenisa-os/shared';
import { fetchProjects, createProject, completeProject, reopenProject, archiveProject } from '../features/projects/api.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';

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

  const filteredGoalsForWorkstream = goals.filter((g) => !workstreamId || g.workstreamId === workstreamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            Concrete Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bounded initiatives executed under workstreams and strategic goals.
          </p>
        </div>

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
      </div>

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
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading projects...
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-xl text-center space-y-3">
          <p className="text-xs text-red-400">{error}</p>
          <button
            onClick={() => void loadProjects()}
            className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create your first project initiative to turn goals into executable checkpoints.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                      {p.workstream?.name}
                    </span>
                    {p.goal && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                        Goal: {p.goal.title}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'ACTIVE'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : p.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white tracking-tight">{p.name}</h2>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {p.description || 'No project description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span>
                    <strong className="text-slate-200">{p._count?.milestones || 0}</strong> Milestones
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleToggleComplete(p)}
                    className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors"
                  >
                    {p.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                  </button>
                  {p.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => void handleArchive(p.id, p.name)}
                      className="text-slate-500 hover:text-red-400 font-semibold transition-colors"
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

      {/* Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Project Initiative</h3>
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
                  onChange={(e) => {
                    setWorkstreamId(e.target.value);
                    setGoalId('');
                  }}
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Strategic Goal (Optional)
                </label>
                <select
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">No specific goal</option>
                  {filteredGoalsForWorkstream.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. KENENISA OS Core System"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                  placeholder="Project scope and deliverable objectives..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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
