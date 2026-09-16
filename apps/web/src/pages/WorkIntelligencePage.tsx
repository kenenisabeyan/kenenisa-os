import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { fetchMilestones } from '../features/milestones/api.js';
import { fetchTasks } from '../features/tasks/api.js';
import type {
  WorkstreamDto,
  GoalDto,
  ProjectDto,
  MilestoneDto,
  TaskDto,
} from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';
import { Badge } from '../components/ui/Badge.js';

export const WorkIntelligencePage: React.FC = () => {
  const navigate = useNavigate();

  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hierarchy expand state
  const [expandedWs, setExpandedWs] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wsData, goalsData, projectsData, milestonesData, tasksData] = await Promise.all([
        fetchWorkstreams({ pageSize: 50 }),
        fetchGoals({ pageSize: 50 }),
        fetchProjects({ pageSize: 50 }),
        fetchMilestones(),
        fetchTasks({ pageSize: 150 }),
      ]);

      setWorkstreams(wsData);
      setGoals(goalsData);
      setProjects(projectsData);
      setMilestones(milestonesData);
      setTasks(tasksData);

      // Expand all workstreams by default
      const expMap: Record<string, boolean> = {};
      wsData.forEach((w: WorkstreamDto) => {
        expMap[w.id] = true;
      });
      setExpandedWs(expMap);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load work intelligence');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const toggleExpand = (id: string) => {
    setExpandedWs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Bottlenecks computation
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const taskWithBlockers = tasks.filter((t) => t.blockingDependencies && t.blockingDependencies.length > 0);
  const unscheduledReadyTasks = tasks.filter((t) => t.status === 'READY' && !t.dueDate);
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  );

  // Workload distribution
  const totalTasks = tasks.length || 1;
  const readyCount = tasks.filter((t) => t.status === 'READY').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const blockedCount = blockedTasks.length;

  return (
    <div className="space-y-6" id="work-intelligence-page">
      <PageHeader
        title="Work Intelligence"
        description="Understand the structure, movement, dependencies, and constraints of your active work."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Work Intelligence' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/tasks')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Task Engine
            </button>
            <button
              onClick={() => navigate('/app/executive')}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Executive View
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          {/* Workload Concentration Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">Ready Work</span>
              <p className="text-2xl font-bold text-slate-900">{readyCount}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#3B82F6] h-full" style={{ width: `${Math.round((readyCount / totalTasks) * 100)}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">In Progress</span>
              <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#6366F1] h-full" style={{ width: `${Math.round((inProgressCount / totalTasks) * 100)}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Blocked Work</span>
              <p className="text-2xl font-bold text-[#FF5A00]">{blockedCount}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FF5A00] h-full" style={{ width: `${Math.round((blockedCount / totalTasks) * 100)}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Completed</span>
              <p className="text-2xl font-bold text-[#22C55E]">{doneCount}</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#22C55E] h-full" style={{ width: `${Math.round((doneCount / totalTasks) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Critical Bottlenecks & Blocker Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Bottleneck Analysis */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Active Bottlenecks & Execution Constraints
                  </h2>
                  <span className="text-xs font-semibold text-[#FF5A00]">
                    {blockedTasks.length + overdueTasks.length} Issues Identified
                  </span>
                </div>

                {blockedTasks.length === 0 && overdueTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                    No active task bottlenecks or overdue items detected. Workflow pipeline is healthy.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-300">
                              BLOCKED
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-semibold text-slate-500">
                              {t.project?.name || 'Task'}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="px-3 py-1.5 bg-white border border-rose-300 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                        >
                          Resolve Blocker
                        </button>
                      </div>
                    ))}

                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              OVERDUE
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-semibold text-slate-500">
                              Due: {new Date(t.dueDate!).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                        >
                          Reschedule
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependency Chain Viewer */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Task Dependency Chains & Relationships
                </h3>

                {taskWithBlockers.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                    No active task dependency links defined. Attach prerequisite dependencies in Task Engine.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taskWithBlockers.map((t) => (
                      <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900">{t.title}</span>
                          <Badge variant={t.status} />
                        </div>

                        <div className="pl-3 border-l-2 border-slate-300 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Prerequisite Blockers:</p>
                          {t.blockingDependencies?.map((dep) => (
                            <div key={dep.id} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                              <span className="truncate">{dep.blockingTask?.title || dep.blockingTaskId}</span>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {dep.blockingTask?.status || 'PENDING'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Unscheduled Ready Work & Work Map Navigator */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Unscheduled Ready Work</h3>
                <p className="text-xs text-slate-500">Tasks marked READY with no calendar allocation</p>

                {unscheduledReadyTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    All ready tasks are scheduled.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {unscheduledReadyTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{t.title}</h4>
                          <span className="text-[10px] font-medium text-slate-500">{t.estimateMinutes} min est</span>
                        </div>
                        <button
                          onClick={() => navigate('/app/planning')}
                          className="px-2.5 py-1 bg-[#3B82F6] hover:bg-blue-600 text-white text-[11px] font-semibold rounded-lg shrink-0 transition-colors"
                        >
                          Plan
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Work Map Hierarchy */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Active Work Hierarchy Map
                </h2>
                <p className="text-xs text-slate-500">
                  Full relational tree: Workstream → Goal → Project → Milestone → Tasks
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {workstreams.map((ws) => {
                const wsGoals = goals.filter((g) => g.workstreamId === ws.id);
                const wsProjects = projects.filter((p) => p.workstreamId === ws.id);
                const isExpanded = expandedWs[ws.id] ?? true;

                return (
                  <div key={ws.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <div
                      onClick={() => toggleExpand(ws.id)}
                      className="p-4 bg-white border-b border-slate-200/90 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-bold">{isExpanded ? '▼' : '▶'}</span>
                        <div>
                          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                            Workstream ({ws.priorityWeight}/10)
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">{ws.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Goals: <strong>{wsGoals.length}</strong></span>
                        <span>Projects: <strong>{wsProjects.length}</strong></span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 space-y-3 bg-slate-50/70">
                        {wsProjects.length === 0 ? (
                          <div className="text-xs text-slate-500 italic pl-6">No projects under this workstream yet.</div>
                        ) : (
                          wsProjects.map((p) => {
                            const pMilestones = milestones.filter((m) => m.projectId === p.id);
                            const pTasks = tasks.filter((t) => t.projectId === p.id);

                            return (
                              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 ml-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                                      Project
                                    </span>
                                    <h4 className="text-xs font-semibold text-slate-900">{p.name}</h4>
                                  </div>
                                  <Badge variant={p.status} />
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                  <span>Milestones: <strong className="text-slate-800">{pMilestones.length}</strong></span>
                                  <span>Tasks: <strong className="text-slate-800">{pTasks.length}</strong></span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
