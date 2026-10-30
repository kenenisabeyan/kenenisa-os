import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { fetchTasks } from '../features/tasks/api.js';
import { fetchEvidenceList } from '../features/evidence/api.js';
import { fetchWeeklyReviews } from '../features/reviews/api.js';
import type {
  WorkstreamDto,
  GoalDto,
  ProjectDto,
  TaskDto,
  EvidenceDto,
  WeeklyReviewDto,
} from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';
import { Badge } from '../components/ui/Badge.js';

export const ExecutivePage: React.FC = () => {
  const navigate = useNavigate();

  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDto[]>([]);
  const [reviews, setReviews] = useState<WeeklyReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [wsData, goalsData, projectsData, tasksData, evidenceData, reviewsData] = await Promise.all([
        fetchWorkstreams({ pageSize: 50 }),
        fetchGoals({ pageSize: 50 }),
        fetchProjects({ pageSize: 50 }),
        fetchTasks({ pageSize: 100 }),
        fetchEvidenceList({ pageSize: 10 }),
        fetchWeeklyReviews(),
      ]);

      setWorkstreams(wsData);
      setGoals(goalsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setEvidence(evidenceData);
      setReviews(reviewsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load executive overview data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Derived factual calculations
  const activeProjects = projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PLANNED');
  const blockedProjects = projects.filter((p) => p.status === 'ON_HOLD');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const readyTasks = tasks.filter((t) => t.status === 'READY');
  const completedTasks = tasks.filter((t) => t.status === 'DONE');

  const p0P1Tasks = tasks
    .filter((t) => (t.priority === 'P0' || t.priority === 'P1') && t.status !== 'DONE')
    .slice(0, 6);

  const recentReviews = reviews.slice(0, 3);

  // Strategic Executive Readiness Ratio calculation
  const totalItems = tasks.length || 1;
  const executionEfficiency = Math.round((completedTasks.length / totalItems) * 100);
  const healthScore = Math.max(0, 100 - (blockedTasks.length * 15 + blockedProjects.length * 10));

  return (
    <div className="space-y-8" id="executive-overview-page">
      <PageHeader
        title="Executive Overview & Strategic Command"
        description="High-level strategic alignment across academic, engineering, product, career, and personal domain trajectories."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Executive Overview' }]}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] sm:text-xs shadow-xs transition-all cursor-pointer"
            >
              Command Center
            </button>
            <button
              onClick={() => navigate('/app/planning')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-[11px] sm:text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>⚡ Strategic Planning</span>
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
          {/* Executive Hero glassmorphic status card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 border border-blue-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl text-white">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
              <div className="space-y-2.5 sm:space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    Strategic Operating Status
                  </span>
                  <span className="text-[11px] sm:text-xs text-blue-100 font-mono">
                    System Time: {new Date().toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  High-Level Executive Execution Dashboard
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                  Real-time visibility into strategy, active workstreams, priority blockers, and verifiable milestones. Deterministic synchronization across all domain layers.
                </p>
              </div>

              {/* Health Score Gauge Tile */}
              <div className="flex items-center gap-3.5 sm:gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-5 shrink-0 self-start lg:self-auto">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-blue-900/40"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={healthScore > 75 ? "text-emerald-300" : healthScore > 40 ? "text-amber-300" : "text-rose-300"}
                      strokeDasharray={`${healthScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-white">{healthScore}%</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-blue-200 tracking-wider">Executive Health</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {healthScore > 80 ? 'Optimal Alignment' : healthScore > 50 ? 'Moderate Blockers' : 'Attention Needed'}
                  </p>
                  <p className="text-[11px] text-blue-100 mt-1">
                    {executionEfficiency}% completion velocity
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Direction Workstreams */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Strategic Workstream Domains</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {workstreams.length} Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Categorized strategic domain pillars guiding goal allocation</p>
              </div>
              <button
                onClick={() => navigate('/app/workstreams')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                Manage Workstreams →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workstreams.map((ws) => {
                const wsGoals = goals.filter((g) => g.workstreamId === ws.id);
                const wsProjects = projects.filter((p) => p.workstreamId === ws.id);
                const weightPercentage = Math.round((ws.priorityWeight / 10) * 100);

                return (
                  <div
                    key={ws.id}
                    onClick={() => navigate('/app/workstreams')}
                    className="group relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer space-y-4 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                          Priority {ws.priorityWeight}/10
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 group-hover:scale-125 transition-transform" />
                      </div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {ws.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                        {ws.description || 'Primary strategic operating domain pillar.'}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Domain Allocation</span>
                        <span className="font-black text-slate-900">{weightPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${weightPercentage}%` }}
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Goals: <strong className="text-slate-900 font-extrabold">{wsGoals.length}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                          Projects: <strong className="text-slate-900 font-extrabold">{wsProjects.length}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic Flow Pipeline */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Strategic Execution Flow Pipeline</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                    7 Delivery Nodes
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">End-to-end alignment from high-level intent to verified output proof</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 font-medium">
                Intent → Verification
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: 'Workstreams', count: workstreams.length, color: 'from-slate-600 to-slate-800', textColor: 'text-slate-900', bg: 'bg-slate-50' },
                { label: 'Goals', count: goals.length, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', bg: 'bg-blue-50/50' },
                { label: 'Projects', count: projects.length, color: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                { label: 'Ready Tasks', count: readyTasks.length, color: 'from-amber-500 to-amber-600', textColor: 'text-amber-600', bg: 'bg-amber-50/50' },
                { label: 'Tasks Done', count: completedTasks.length, color: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                { label: 'Evidence Vault', count: evidence.length, color: 'from-cyan-500 to-cyan-600', textColor: 'text-cyan-600', bg: 'bg-cyan-50/50' },
                { label: 'Reviews', count: reviews.length, color: 'from-purple-500 to-purple-600', textColor: 'text-purple-600', bg: 'bg-purple-50/50' },
              ].map((step, idx) => (
                <div
                  key={step.label}
                  className={`relative ${step.bg} border border-slate-200/90 rounded-2xl p-4 text-center hover:border-blue-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between shadow-2xs group`}
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Node 0{idx + 1}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                  </div>
                  <div className="my-2.5">
                    <p className={`text-2xl sm:text-3xl font-black ${step.textColor} tracking-tight`}>{step.count}</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{step.label}</p>
                  </div>
                  <div className={`w-full h-1.5 bg-gradient-to-r ${step.color} rounded-full shadow-2xs`} />
                </div>
              ))}
            </div>
          </div>

          {/* Executive Health Indicators & Top Priorities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Critical Strategic Priorities & Concrete Evidence */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Critical Strategic Priorities (P0 & P1)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        {p0P1Tasks.length} Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">System-derived high priority active commitments requiring immediate focus</p>
                  </div>
                  <button
                    onClick={() => navigate('/app/tasks')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All Tasks →
                  </button>
                </div>

                {p0P1Tasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No critical open P0 or P1 tasks. Operational baseline is clear.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {p0P1Tasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 hover:bg-white transition-all shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={t.priority} />
                            <Badge variant={t.status} />
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider truncate">
                              {t.project?.name || 'General Project'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 truncate">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs cursor-pointer"
                        >
                          Execute Task
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Evidence Vault preview */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Recent Verified Proof & Evidence</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {evidence.length} Total
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">Commits, pull requests, documents, and verified outcomes</p>
                  </div>
                  <button
                    onClick={() => navigate('/app/evidence')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Evidence Vault →
                  </button>
                </div>

                {evidence.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No evidence items captured yet. Log pull requests, commits, and artifacts in Evidence Vault.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidence.slice(0, 4).map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ {ev.type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{ev.date}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{ev.title}</h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Executive System Health & Quick Action Matrix */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Executive System Health</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-700">Active Projects</span>
                    <span className="font-extrabold text-slate-900">{activeProjects.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-700">Blocked Tasks</span>
                    <span className={`font-extrabold ${blockedTasks.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {blockedTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-700">Paused Projects</span>
                    <span className="font-extrabold text-slate-900">{blockedProjects.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-700">Weekly Reviews</span>
                    <span className="font-extrabold text-emerald-600">{recentReviews.length}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Matrix */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Strategic Portals</h3>

                <div className="space-y-2.5">
                  <button
                    onClick={() => navigate('/app/work-intelligence')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/90 hover:border-blue-300 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                      Work Intelligence Map
                    </span>
                    <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/reviews')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-purple-50/60 border border-slate-200/90 hover:border-purple-300 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 group-hover:scale-125 transition-transform" />
                      Weekly Review Loop
                    </span>
                    <span className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all">→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/career')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/90 hover:border-emerald-300 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                      Career & Opportunity Hub
                    </span>
                    <span className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/intelligence')}
                    className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/50 to-blue-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-left text-xs font-bold text-purple-900 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                      AI Advisory Mentor
                    </span>
                    <span className="text-purple-600 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
