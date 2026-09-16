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
    .slice(0, 5);

  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="space-y-6" id="executive-overview-page">
      <PageHeader
        title="Executive Overview"
        description="A high-level strategic view of academic, engineering, product, career, and personal direction."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Executive Overview' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Command Center
            </button>
            <button
              onClick={() => navigate('/app/planning')}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Plan Today
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
          {/* Strategic Direction Workstreams */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase text-slate-500">
                Strategic Direction & Active Workstreams
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {workstreams.length} Configured Domains
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workstreams.map((ws) => {
                const wsGoals = goals.filter((g) => g.workstreamId === ws.id);
                const wsProjects = projects.filter((p) => p.workstreamId === ws.id);

                return (
                  <div
                    key={ws.id}
                    onClick={() => navigate('/app/workstreams')}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                          Weight: {ws.priorityWeight}/10
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{ws.name}</h3>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3AB1EC]" title="Active Workstream" />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                      {ws.description || 'Primary operating workstream domain.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>
                        Goals: <strong className="text-slate-800">{wsGoals.length}</strong>
                      </span>
                      <span>
                        Projects: <strong className="text-slate-800">{wsProjects.length}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strategic Flow Pipeline */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Strategic Execution Flow Pipeline
              </h2>
              <span className="text-xs text-slate-500">Intent → Execution → Verified Output</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Workstreams</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{workstreams.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">Goals</p>
                <p className="text-xl font-bold text-[#3B82F6] mt-1">{goals.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Projects</p>
                <p className="text-xl font-bold text-[#6366F1] mt-1">{projects.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#FFD700] uppercase tracking-wider">Tasks Ready</p>
                <p className="text-xl font-bold text-amber-600 mt-1">{readyTasks.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Tasks Done</p>
                <p className="text-xl font-bold text-[#22C55E] mt-1">{completedTasks.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#3AB1EC] uppercase tracking-wider">Evidence</p>
                <p className="text-xl font-bold text-[#3AB1EC] mt-1">{evidence.length}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">Reviews</p>
                <p className="text-xl font-bold text-[#A855F7] mt-1">{reviews.length}</p>
              </div>
            </div>
          </div>

          {/* Executive Health Indicators & Top Priorities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Strategic Priorities & High Impact Work */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Critical Strategic Priorities (P0 & P1)
                    </h3>
                    <p className="text-xs text-slate-500">System-derived high priority active commitments</p>
                  </div>
                  <button
                    onClick={() => navigate('/app/tasks')}
                    className="text-xs font-semibold text-[#3B82F6] hover:underline"
                  >
                    View All Tasks →
                  </button>
                </div>

                {p0P1Tasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                    No critical open P0 or P1 tasks. Excellent operational baseline.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {p0P1Tasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={t.priority} />
                            <Badge variant={t.status} />
                            <span className="text-[10px] font-semibold text-slate-500 truncate">
                              {t.project?.name || 'General Project'}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{t.title}</h4>
                        </div>
                        <button
                          onClick={() => navigate('/app/tasks')}
                          className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                        >
                          Execute
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Executive Recent Activity & Evidence */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Recent Concrete Evidence & Verified Proof
                  </h3>
                  <button
                    onClick={() => navigate('/app/evidence')}
                    className="text-xs font-semibold text-[#3B82F6] hover:underline"
                  >
                    Evidence Vault →
                  </button>
                </div>

                {evidence.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                    No evidence items captured yet. Attach pull requests, commits, and artifacts.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {evidence.slice(0, 4).map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">
                            {ev.type.replace('_', ' ')}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 truncate">{ev.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500 font-medium shrink-0">{ev.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: System Health & Action Matrix */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Executive System Health</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Active Projects</span>
                    <span className="font-bold text-slate-900">{activeProjects.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Blocked Work Items</span>
                    <span className={`font-bold ${blockedTasks.length > 0 ? 'text-[#FF5A00]' : 'text-slate-900'}`}>
                      {blockedTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Paused Projects</span>
                    <span className="font-bold text-slate-900">{blockedProjects.length}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700">Recent Reviews Completed</span>
                    <span className="font-bold text-[#22C55E]">{recentReviews.length}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Matrix */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Navigation Actions</h3>

                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/app/work-intelligence')}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Work Intelligence Map</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/reviews')}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Weekly Review Loop</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/career')}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>Career & Opportunity Hub</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => navigate('/app/intelligence')}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#A855F7]/10 hover:bg-[#A855F7]/20 border border-[#A855F7]/30 text-left text-xs font-semibold text-[#7e22ce] flex items-center justify-between transition-colors"
                  >
                    <span>AI Advisory Mentor</span>
                    <span>→</span>
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
