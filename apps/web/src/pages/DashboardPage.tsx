import React, { useEffect, useState, useCallback } from 'react';
import { fetchDashboard } from '../features/dashboard/api.js';
import { startTask, completeTask, blockTask } from '../features/tasks/api.js';
import { DashboardDto, TaskDto } from '@kenenisa-os/shared';

export const DashboardPage: React.FC = () => {
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
      await loadDashboard();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await completeTask(taskId);
      await loadDashboard();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await blockTask(taskId);
      await loadDashboard();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to mark task as blocked');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]" id="dashboard-loading">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Initializing Command Center Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center my-8" id="dashboard-error">
        <h3 className="text-red-400 font-bold text-lg mb-2">Error Loading Dashboard</h3>
        <p className="text-slate-300 text-sm mb-4">{error}</p>
        <button
          onClick={() => { void loadDashboard(); }}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs shadow-lg transition-all"
        >
          Retry Load
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { summary, nextBestAction, today, workstreams, activeProjects, blockedTasks, overdueTasks, upcomingTasks, recentActivity } = data;

  const priorityColor = (priority: TaskDto['priority']) => {
    switch (priority) {
      case 'P0':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'P1':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'P2':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-8 pb-12" id="command-center-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
              Step 6 Engine
            </span>
            <span className="text-xs text-slate-400">Target Date: {today.date}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            Deterministic execution recommendations and personal operating status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-dashboard-btn"
            onClick={() => { void loadDashboard(); }}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <svg
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh System
          </button>
        </div>
      </div>

      {/* Hero: Next Best Action Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="next-best-action-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              DETERMINISTIC RECOMMENDATION
            </span>
          </div>
          {nextBestAction && (
            <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-full border border-cyan-500/30">
              <span className="text-xs text-slate-400 font-medium">Evaluation Score</span>
              <span className="text-base font-extrabold text-cyan-400" id="nba-score">
                {nextBestAction.score}/100
              </span>
            </div>
          )}
        </div>

        {nextBestAction && nextBestAction.recommendedTask ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${priorityColor(nextBestAction.recommendedTask.priority)}`}>
                {nextBestAction.recommendedTask.priority}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {nextBestAction.recommendedTask.status}
              </span>
              {nextBestAction.recommendedTask.project && (
                <span className="text-xs text-slate-400 bg-slate-950/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                  Project: {nextBestAction.recommendedTask.project.name}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight" id="nba-task-title">
              {nextBestAction.recommendedTask.title}
            </h2>

            {nextBestAction.recommendedTask.description && (
              <p className="text-slate-300 text-sm mb-6 max-w-3xl leading-relaxed">
                {nextBestAction.recommendedTask.description}
              </p>
            )}

            {/* Score Breakdown Reasons */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Scoring Breakdown Criteria
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {nextBestAction.reasons.map((r, idx) => (
                  <div key={idx} className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">{r.category}</span>
                      <span className="text-cyan-400 font-bold">+{r.points}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {nextBestAction.recommendedTask.status === 'READY' && (
                <button
                  id="nba-start-btn"
                  onClick={() => { void handleStartTask(nextBestAction.recommendedTask!.id); }}
                  disabled={actionLoading === nextBestAction.recommendedTask.id}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Start Task Now
                </button>
              )}

              {nextBestAction.recommendedTask.status === 'IN_PROGRESS' && (
                <button
                  id="nba-complete-btn"
                  onClick={() => { void handleCompleteTask(nextBestAction.recommendedTask!.id); }}
                  disabled={actionLoading === nextBestAction.recommendedTask.id}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark Complete
                </button>
              )}

              <button
                id="nba-block-btn"
                onClick={() => { void handleBlockTask(nextBestAction.recommendedTask!.id); }}
                disabled={actionLoading === nextBestAction.recommendedTask.id}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-all"
              >
                Mark Blocked
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Queue Cleared!</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No active or ready tasks found in your candidate pool. All blocked or done. Create new tasks in Projects or Milestones to populate execution plan.
            </p>
          </div>
        )}
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3" id="summary-metrics">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Workstreams</div>
          <div className="text-2xl font-black text-white mt-1">{summary.activeWorkstreams}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Goals</div>
          <div className="text-2xl font-black text-white mt-1">{summary.activeGoals}</div>
          <div className="text-[10px] text-slate-400 mt-1">In Progress</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Projects</div>
          <div className="text-2xl font-black text-white mt-1">{summary.activeProjects}</div>
          <div className="text-[10px] text-slate-400 mt-1">Active</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Ready Tasks</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{summary.readyTasks}</div>
          <div className="text-[10px] text-slate-400 mt-1">Queue</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">In Progress</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{summary.inProgressTasks}</div>
          <div className="text-[10px] text-slate-400 mt-1">Current</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Blocked</div>
          <div className={`text-2xl font-black mt-1 ${summary.blockedTasks > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {summary.blockedTasks}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Needs Action</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">Overdue</div>
          <div className={`text-2xl font-black mt-1 ${summary.overdueTasks > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {summary.overdueTasks}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Late</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
          <div className="text-[11px] font-semibold text-slate-400">7d Completed</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{summary.completedTasksRecent}</div>
          <div className="text-[10px] text-slate-400 mt-1">Velocity</div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols wide): Today Focus & Critical Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Focus */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl" id="today-focus-section">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Today&apos;s Focus</h3>
                <p className="text-slate-400 text-xs mt-0.5">Tasks due today or currently in progress</p>
              </div>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
                {today.dueToday.length + today.inProgress.length} items
              </span>
            </div>

            {today.dueToday.length === 0 && today.inProgress.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                No tasks due today or in progress right now.
              </div>
            ) : (
              <div className="space-y-3">
                {[...today.inProgress, ...today.dueToday].map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {task.status}
                        </span>
                        {task.project && (
                          <span className="text-[11px] text-slate-400 truncate">
                            • {task.project.name}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.status === 'READY' && (
                        <button
                          onClick={() => { void handleStartTask(task.id); }}
                          disabled={actionLoading === task.id}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition-all"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => { void handleCompleteTask(task.id); }}
                          disabled={actionLoading === task.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-all"
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

          {/* Blocked Tasks Section */}
          {blockedTasks.length > 0 && (
            <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 shadow-xl" id="blocked-tasks-section">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Blocked Tasks Attention Needed
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Tasks waiting on dependencies or external blockers</p>
                </div>
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-bold">
                  {blockedTasks.length} Blocked
                </span>
              </div>

              <div className="space-y-3">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.blockingDependencies && task.blockingDependencies.length > 0 && (
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Blocked By:
                        </div>
                        {task.blockingDependencies.map((dep) => (
                          <div key={dep.id} className="flex items-center justify-between text-xs">
                            <span className="text-slate-200">• {dep.blockingTask?.title || 'Unknown Task'}</span>
                            <span className="text-slate-400 text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 rounded">
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
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 shadow-xl" id="overdue-tasks-section">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-amber-400">Overdue Tasks</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Tasks past their scheduled target date</p>
                </div>
                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold">
                  {overdueTasks.length} Overdue
                </span>
              </div>

              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      <p className="text-xs text-amber-400/90 mt-0.5">
                        Due: {task.dueDate ? task.dueDate.split('T')[0] : 'N/A'}
                      </p>
                    </div>

                    <button
                      onClick={() => { void handleStartTask(task.id); }}
                      disabled={actionLoading === task.id}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition-all"
                    >
                      Start Task
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks (Next 7 Days) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl" id="upcoming-tasks-section">
            <h3 className="text-xl font-bold text-white mb-1">Upcoming (Next 7 Days)</h3>
            <p className="text-slate-400 text-xs mb-4">Scheduled workload timeline preview</p>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                No tasks scheduled for the next 7 days.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl" id="workstreams-overview-section">
            <h3 className="text-lg font-bold text-white mb-4">Workstreams</h3>
            <div className="space-y-3">
              {workstreams.map((ws) => (
                <div key={ws.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">{ws.name}</h4>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                      Weight {ws.priorityWeight}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>{ws._count?.goals || 0} Goals</span>
                    <span>•</span>
                    <span>{ws._count?.projects || 0} Projects</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl" id="active-projects-section">
            <h3 className="text-lg font-bold text-white mb-4">Active Projects</h3>
            <div className="space-y-3">
              {activeProjects.map((proj) => (
                <div key={proj.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{proj.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColor(proj.priority)}`}>
                      {proj.priority}
                    </span>
                  </div>
                  {proj.workstream && (
                    <div className="text-xs text-slate-400 mt-1">
                      {proj.workstream.name}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span>{proj._count?.tasks || 0} Tasks</span>
                    <span>•</span>
                    <span>{proj._count?.milestones || 0} Milestones</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl" id="recent-activity-section">
            <h3 className="text-lg font-bold text-white mb-4">Recent Audit Activity</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity logs.</p>
              ) : (
                recentActivity.map((act) => (
                  <div key={act.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                    <div className="text-slate-200 font-medium">{act.description}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
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
