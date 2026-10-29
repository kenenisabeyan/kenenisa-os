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
        fetchTasks({ pageSize: 100 }),
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
    <div className="space-y-8" id="work-intelligence-page">
      <PageHeader
        title="Work Intelligence & Bottleneck Analysis"
        description="Comprehensive visibility into operating structure, task dependencies, workload concentration, and bottleneck constraints."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Work Intelligence' }]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app/tasks')}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-colors shadow-sm"
            >
              Task Engine
            </button>
            <button
              onClick={() => navigate('/app/executive')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Executive Overview</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Ready Work</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{readyCount}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Share</span>
                  <span>{Math.round((readyCount / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((readyCount / totalTasks) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">In Progress</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{inProgressCount}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Active</span>
                  <span>{Math.round((inProgressCount / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((inProgressCount / totalTasks) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Blocked Work</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-600">{blockedCount}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Blocked</span>
                  <span>{Math.round((blockedCount / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((blockedCount / totalTasks) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3 relative overflow-hidden">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Completed</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{doneCount}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Done</span>
                  <span>{Math.round((doneCount / totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((doneCount / totalTasks) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Bottlenecks & Blocker Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Bottleneck Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Active Execution Bottlenecks</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                        {blockedTasks.length + overdueTasks.length} Flags
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">System detected tasks holding up progress or past due date</p>
                  </div>
                </div>

                {blockedTasks.length === 0 && overdueTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active task bottlenecks or overdue items detected. Execution flow is clear.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-rose-300 transition-all shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-300">
                              BLOCKED
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                              {t.project?.name || 'General Project'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 break-words">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="w-full sm:w-auto text-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
                        >
                          Resolve Blocker
                        </button>
                      </div>
                    ))}

                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-amber-300 transition-all shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              OVERDUE
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-mono text-amber-700 font-semibold">
                              Due: {new Date(t.dueDate!).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 break-words">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="w-full sm:w-auto text-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
                        >
                          Reschedule Task
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependency Chain Viewer */}
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Task Dependency Chains & Prerequisites
                  </h3>
                  <p className="text-xs text-slate-500">Map of tasks dependent on completing prior prerequisite tasks</p>
                </div>

                {taskWithBlockers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active task dependency links defined. Link dependencies in Task Engine.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taskWithBlockers.map((t) => (
                      <div key={t.id} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{t.title}</span>
                          <Badge variant={t.status} />
                        </div>

                        <div className="pl-3 border-l-2 border-indigo-500 space-y-2">
                          <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            Prerequisite Blockers:
                          </p>
                          {t.blockingDependencies?.map((dep) => (
                            <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                              <span className="font-semibold break-words">{dep.blockingTask?.title || dep.blockingTaskId}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 self-start sm:self-auto shrink-0">
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

            {/* Right Col: Unscheduled Ready Work & Quick Map */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Unscheduled Ready Work</h3>
                  <p className="text-xs text-slate-500">Tasks ready for execution without target schedule dates</p>
                </div>

                {unscheduledReadyTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                    All ready tasks are scheduled.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {unscheduledReadyTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{t.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{t.estimateMinutes} min est</span>
                        </div>
                        <button
                          onClick={() => navigate('/app/planning')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shrink-0 transition-colors shadow-xs"
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
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Active Work Hierarchy Map</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {workstreams.length} Workstream Nodes
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Full relational tree breakdown: Workstream → Goal → Project → Milestone → Tasks
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {workstreams.map((ws) => {
                const wsGoals = goals.filter((g) => g.workstreamId === ws.id);
                const wsProjects = projects.filter((p) => p.workstreamId === ws.id);
                const isExpanded = expandedWs[ws.id] ?? true;

                return (
                  <div key={ws.id} className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/40">
                    <div
                      onClick={() => toggleExpand(ws.id)}
                      className="p-3.5 sm:p-5 bg-white border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                        <span className="text-xs text-slate-400 font-bold w-4 text-center mt-0.5 sm:mt-0">{isExpanded ? '▼' : '▶'}</span>
                        <div>
                          <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                            Workstream Pillar ({ws.priorityWeight}/10 Weight)
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{ws.name}</h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold pl-6 sm:pl-0">
                        <span>Goals: <strong className="text-slate-900">{wsGoals.length}</strong></span>
                        <span>Projects: <strong className="text-slate-900">{wsProjects.length}</strong></span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-slate-50/70">
                        {wsProjects.length === 0 ? (
                          <div className="text-xs text-slate-400 italic pl-3 sm:pl-6">No projects assigned under this workstream.</div>
                        ) : (
                          wsProjects.map((p) => {
                            const pMilestones = milestones.filter((m) => m.projectId === p.id);
                            const pTasks = tasks.filter((t) => t.projectId === p.id);

                            return (
                              <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 ml-2 sm:ml-6 shadow-2xs">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                      Project
                                    </span>
                                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{p.name}</h4>
                                  </div>
                                  <Badge variant={p.status} />
                                </div>

                                <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                                  <span>Milestones: <strong className="text-slate-900">{pMilestones.length}</strong></span>
                                  <span>Tasks: <strong className="text-slate-900">{pTasks.length}</strong></span>
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
