import React, { useEffect, useState, useCallback } from 'react';
import { fetchDashboard } from '../features/dashboard/api.js';
import { startTask, completeTask, blockTask } from '../features/tasks/api.js';
import { DashboardDto, TaskDto } from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboard();
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load Command Center data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleStartTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await startTask(taskId);
      showToast('Task started successfully', 'success');
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to start task', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await completeTask(taskId);
      showToast('Task completed', 'success');
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to complete task', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await blockTask(taskId);
      showToast('Task marked as blocked', 'warning');
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to mark task as blocked', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6" id="dashboard-loading">
        <PageHeader title="Command Center" description="Deterministic execution recommendations and personal operating status." />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-8" id="dashboard-error">
        <ErrorStateCard title="Error Loading Command Center" message={error} onRetry={() => void loadDashboard()} />
      </div>
    );
  }

  if (!data) return null;

  const { summary, nextBestAction, today, workstreams, activeProjects, blockedTasks, overdueTasks, upcomingTasks, recentActivity } = data;

  const priorityBadgeStyle = (priority: TaskDto['priority']) => {
    switch (priority) {
      case 'P0':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/30 ring-1 ring-rose-500/20';
      case 'P1':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30 ring-1 ring-amber-500/20';
      case 'P2':
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30 ring-1 ring-cyan-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans" id="command-center-dashboard">
      {/* Top Bar Header */}
      <PageHeader
        title="Command Center"
        description="Deterministic execution recommendations and personal operating status."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Today' }]}
        actions={
          <button
            id="refresh-dashboard-btn"
            onClick={() => { void loadDashboard(); }}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 text-cyan-600 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh System</span>
          </button>
        }
      />

      {/* 7 Core Operating Questions Front-Door Overview */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4" id="front-door-questions-panel">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
              COMMAND CENTER &bull; OPERATING CONTEXT ANSWERS
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider">REAL-TIME DOMAIN INTELLIGENCE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Question 1: WHERE AM I? */}
          <div className="group relative bg-gradient-to-br from-blue-50/50 via-white to-white rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v1m0 10v1m-7-6h1m10 0h1m-2.93-4.07l-.71.71m-7.07 7.07l-.71.71m0-8.49l.71.71m7.07 7.07l.71.71" />
                </svg>
                WHERE AM I?
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500/80 group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">Strategic Context</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="font-bold text-slate-800">{summary.activeWorkstreams}</span> Workstreams &bull; <span className="font-bold text-slate-800">{summary.activeGoals}</span> Goals
            </div>
          </div>

          {/* Question 2: WHAT MATTERS NOW? */}
          <div className="group relative bg-gradient-to-br from-indigo-50/50 via-white to-white rounded-2xl p-4 border border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                WHAT MATTERS NOW?
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500/80 group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">Target Outcomes</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="font-bold text-slate-800">{summary.activeProjects}</span> Active Projects &bull; <span className="font-bold text-slate-800">{summary.readyTasks}</span> Ready Tasks
            </div>
          </div>

          {/* Question 3: WHAT IS HAPPENING? */}
          <div className="group relative bg-gradient-to-br from-cyan-50/50 via-white to-white rounded-2xl p-4 border border-cyan-100 hover:border-cyan-300 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-cyan-600 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                WHAT IS HAPPENING?
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-500/80 group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">Execution Focus</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className="font-bold text-slate-800">{today.inProgress.length}</span> Active Focus &bull; <span className="font-bold text-slate-800">{today.dueToday.length}</span> Scheduled
            </div>
          </div>

          {/* Question 4: WHAT NEEDS ATTENTION? */}
          <div className="group relative bg-gradient-to-br from-rose-50/50 via-white to-white rounded-2xl p-4 border border-rose-100 hover:border-rose-300 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                WHAT NEEDS ATTENTION?
              </span>
              <span className={`w-2 h-2 rounded-full ${summary.blockedTasks > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">System Constraints</div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
              <span className={`font-bold ${summary.blockedTasks > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {summary.blockedTasks > 0 ? `${summary.blockedTasks} Blocked` : 'No Blockers'}
              </span>
              &bull;
              <span className={`font-bold ${summary.overdueTasks > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {summary.overdueTasks > 0 ? `${summary.overdueTasks} Overdue` : 'On Schedule'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: Next Best Action / Deterministic Recommendation */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-blue-500/30"
        id="next-best-action-card"
      >
        {/* Background Decorative Accent Mesh & Glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-cyan-400">
                WHAT SHOULD I DO NEXT? &bull; DETERMINISTIC RECOMMENDATION
              </span>
            </div>

            {nextBestAction && (
              <div className="flex items-center gap-2.5 bg-slate-800/80 backdrop-blur px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-md self-start sm:self-auto">
                <span className="text-xs text-slate-300 font-medium">Execution Priority Index</span>
                <span className="text-base font-black text-cyan-400" id="nba-score">
                  {nextBestAction.score}/100
                </span>
              </div>
            )}
          </div>

          {nextBestAction && nextBestAction.recommendedTask ? (
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3">
                <span className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-black uppercase border ${priorityBadgeStyle(nextBestAction.recommendedTask.priority)}`}>
                  {nextBestAction.recommendedTask.priority} Priority
                </span>
                <span className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                  Status: {nextBestAction.recommendedTask.status}
                </span>
                {nextBestAction.recommendedTask.project && (
                  <span className="text-xs text-cyan-300 bg-cyan-950/60 px-2.5 sm:px-3 py-1 rounded-lg border border-cyan-800/60 font-semibold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {nextBestAction.recommendedTask.project.name}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-white mb-3 tracking-tight leading-tight" id="nba-task-title">
                {nextBestAction.recommendedTask.title}
              </h2>

              {nextBestAction.recommendedTask.description && (
                <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-3xl leading-relaxed">
                  {nextBestAction.recommendedTask.description}
                </p>
              )}

              {/* Algorithm Scoring Breakdown Grid */}
              <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 mb-6">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Algorithm Scoring Criteria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {nextBestAction.reasons.map((r, idx) => (
                    <div key={idx} className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/60 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-bold">{r.category}</span>
                        <span className="text-cyan-400 font-black">+{r.points}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {nextBestAction.recommendedTask.status === 'READY' && (
                  <button
                    id="nba-start-btn"
                    onClick={() => { void handleStartTask(nextBestAction.recommendedTask!.id); }}
                    disabled={actionLoading === nextBestAction.recommendedTask.id}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Start Execution Now
                  </button>
                )}

                {nextBestAction.recommendedTask.status === 'IN_PROGRESS' && (
                  <button
                    id="nba-complete-btn"
                    onClick={() => { void handleCompleteTask(nextBestAction.recommendedTask!.id); }}
                    disabled={actionLoading === nextBestAction.recommendedTask.id}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark Complete & Verify
                  </button>
                )}

                <button
                  id="nba-block-btn"
                  onClick={() => { void handleBlockTask(nextBestAction.recommendedTask!.id); }}
                  disabled={actionLoading === nextBestAction.recommendedTask.id}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-bold transition-all disabled:opacity-50 text-center"
                >
                  Flag Blocked
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-lg shadow-emerald-500/10">
                ✓
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Execution Queue Cleared!</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                No active or ready tasks found in your candidate pool. All tasks are completed or blocked. Create new tasks in Projects or Milestones to populate the execution pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5" id="summary-metrics">
        {/* Workstreams */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workstreams</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeWorkstreams}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Core</div>
        </div>

        {/* Goals */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Goals</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeGoals}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">In Progress</div>
        </div>

        {/* Projects */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-cyan-300 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projects</span>
            <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeProjects}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Build</div>
        </div>

        {/* Ready Tasks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-sky-300 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ready</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2 tracking-tight">{summary.readyTasks}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Candidate Queue</div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-blue-400 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In Progress</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2 tracking-tight">{summary.inProgressTasks}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Focus</div>
        </div>

        {/* Blocked */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-rose-300 transition-all duration-200 group relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${summary.blockedTasks > 0 ? 'bg-rose-500' : 'bg-slate-300'} opacity-80`} />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blocked</span>
            <span className={`w-2 h-2 rounded-full ${summary.blockedTasks > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <div className={`text-2xl font-black mt-2 tracking-tight ${summary.blockedTasks > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {summary.blockedTasks}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Needs Action</div>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-200 group relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1 ${summary.overdueTasks > 0 ? 'bg-amber-500' : 'bg-slate-300'} opacity-80`} />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overdue</span>
            <span className={`w-2 h-2 rounded-full ${summary.overdueTasks > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <div className={`text-2xl font-black mt-2 tracking-tight ${summary.overdueTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {summary.overdueTasks}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Past Target</div>
        </div>

        {/* 7d Completed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-200 group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">7d Done</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2 tracking-tight">{summary.completedTasksRecent}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-1">Verified Impact</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols wide): Today Focus & Critical Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Focus */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="today-focus-section">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Today&apos;s Execution Focus</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Tasks scheduled for today or active right now</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold border border-blue-200/80">
                {today.dueToday.length + today.inProgress.length} items
              </span>
            </div>

            {today.dueToday.length === 0 && today.inProgress.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                No tasks scheduled for today or currently in progress.
              </div>
            ) : (
              <div className="space-y-3">
                {[...today.inProgress, ...today.dueToday].map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 hover:bg-blue-50/20 transition-all shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${priorityBadgeStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 text-slate-700 border border-slate-300 uppercase">
                          {task.status}
                        </span>
                        {task.project && (
                          <span className="text-[11px] text-slate-600 truncate font-semibold flex items-center gap-1">
                            &bull; {task.project.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.status === 'READY' && (
                        <button
                          onClick={() => { void handleStartTask(task.id); }}
                          disabled={actionLoading === task.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => { void handleCompleteTask(task.id); }}
                          disabled={actionLoading === task.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Blocked Tasks Alert Section */}
          {blockedTasks.length > 0 && (
            <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4" id="blocked-tasks-section">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div>
                  <h3 className="text-base font-extrabold text-rose-700 flex items-center gap-2">
                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Blocked Tasks Attention Needed
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Tasks waiting on dependencies or external blockers</p>
                </div>
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-black">
                  {blockedTasks.length} Blocked
                </span>
              </div>

              <div className="space-y-3">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${priorityBadgeStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.blockingDependencies && task.blockingDependencies.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Blocked By:
                        </div>
                        {task.blockingDependencies.map((dep) => (
                          <div key={dep.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-800 font-semibold">• {dep.blockingTask?.title || 'Unknown Task'}</span>
                            <span className="text-slate-600 text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                              {dep.blockingTask?.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Tasks Section */}
          {overdueTasks.length > 0 && (
            <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4" id="overdue-tasks-section">
              <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                <div>
                  <h3 className="text-base font-extrabold text-amber-800">Overdue Target Items</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-medium">Tasks past their scheduled target date</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-black">
                  {overdueTasks.length} Overdue
                </span>
              </div>

              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="bg-amber-50/40 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">
                        Target Date: {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}
                      </p>
                    </div>

                    <button
                      onClick={() => { void handleStartTask(task.id); }}
                      disabled={actionLoading === task.id}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      Start Task
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Timeline (Next 7 Days) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="upcoming-tasks-section">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Upcoming (Next 7 Days)</h3>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">Scheduled workload timeline preview</p>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                No tasks scheduled for the next 7 days.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 flex items-center justify-between text-xs hover:bg-slate-100/60 transition-colors">
                    <span className="font-semibold text-slate-800 truncate">{task.title}</span>
                    <span className="text-slate-500 font-mono text-[11px] shrink-0 font-medium">
                      {task.dueDate ? task.dueDate.split('T')[0] : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col wide): Workstreams, Active Projects & Audit Activity */}
        <div className="space-y-8">
          {/* Workstreams Overview */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="workstreams-overview-section">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Workstreams Overview</h3>
            <div className="space-y-3">
              {workstreams.map((ws) => (
                <div key={ws.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-extrabold text-slate-900">{ws.name}</h4>
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded uppercase">
                      Priority {ws.priorityWeight}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                    <span>{ws._count?.goals || 0} Goals</span>
                    <span>&bull;</span>
                    <span>{ws._count?.projects || 0} Projects</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="active-projects-section">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Active Projects</h3>
            <div className="space-y-3">
              {activeProjects.map((proj) => (
                <div key={proj.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 hover:border-blue-200 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">{proj.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${priorityBadgeStyle(proj.priority)}`}>
                      {proj.priority}
                    </span>
                  </div>
                  {proj.workstream && (
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {proj.workstream.name}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                    <span>{proj._count?.tasks || 0} Tasks</span>
                    <span>&bull;</span>
                    <span>{proj._count?.milestones || 0} Milestones</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Operating Audit Activity */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="recent-activity-section">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Operating Activity</h3>
            <div className="space-y-2.5">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 font-medium">No recent operating activity.</p>
              ) : (
                recentActivity.map((act) => (
                  <div key={act.id} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
                    <div className="text-slate-800 font-semibold leading-snug">{act.description}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
