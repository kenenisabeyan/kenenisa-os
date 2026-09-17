import React, { useState, useEffect } from 'react';
import type {
  AnalyticsPeriod,
  AnalyticsOverviewDto,
  ExecutionTrendPointDto,
  ProjectAnalyticsItemDto,
  GoalAnalyticsItemDto,
  WorkstreamAnalyticsItemDto,
  PlanningAnalyticsDto,
  CapacityAnalyticsDto,
  OverdueAnalyticsDto,
  BlockedAnalyticsDto,
  LearningAnalyticsDto,
  LearningTrendPointDto,
  SkillAnalyticsItemDto,
  EvidenceAnalyticsDto,
  WeeklyHistorySnapshotDto,
} from '@kenenisa-os/shared';
import {
  fetchAnalyticsOverview,
  fetchExecutionTrend,
  fetchProjectAnalytics,
  fetchGoalAnalytics,
  fetchWorkstreamAnalytics,
  fetchPlanningAnalytics,
  fetchCapacityAnalytics,
  fetchOverdueAnalytics,
  fetchBlockedAnalytics,
  fetchLearningAnalytics,
  fetchLearningTrend,
  fetchSkillAnalytics,
  fetchEvidenceAnalytics,
  fetchWeeklyHistory,
} from '../features/analytics/api.js';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'workstreams' | 'learning' | 'history'>('overview');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverviewDto | null>(null);
  const [executionTrend, setExecutionTrend] = useState<ExecutionTrendPointDto[]>([]);
  const [projects, setProjects] = useState<ProjectAnalyticsItemDto[]>([]);
  const [goals, setGoals] = useState<GoalAnalyticsItemDto[]>([]);
  const [workstreams, setWorkstreams] = useState<WorkstreamAnalyticsItemDto[]>([]);
  const [planning, setPlanning] = useState<PlanningAnalyticsDto | null>(null);
  const [capacity, setCapacity] = useState<CapacityAnalyticsDto | null>(null);
  const [overdue, setOverdue] = useState<OverdueAnalyticsDto | null>(null);
  const [blocked, setBlocked] = useState<BlockedAnalyticsDto | null>(null);
  const [learning, setLearning] = useState<LearningAnalyticsDto | null>(null);
  const [learningTrend, setLearningTrend] = useState<LearningTrendPointDto[]>([]);
  const [skills, setSkills] = useState<SkillAnalyticsItemDto[]>([]);
  const [evidence, setEvidence] = useState<EvidenceAnalyticsDto | null>(null);
  const [history, setHistory] = useState<WeeklyHistorySnapshotDto[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = {
          period,
          from: period === 'custom' && customFrom ? customFrom : undefined,
          to: period === 'custom' && customTo ? customTo : undefined,
        };

        const [
          overviewRes,
          execTrendRes,
          projectsRes,
          goalsRes,
          workstreamsRes,
          planningRes,
          capacityRes,
          overdueRes,
          blockedRes,
          learningRes,
          learningTrendRes,
          skillsRes,
          evidenceRes,
          historyRes,
        ] = await Promise.all([
          fetchAnalyticsOverview(query),
          fetchExecutionTrend(query),
          fetchProjectAnalytics(query),
          fetchGoalAnalytics(query),
          fetchWorkstreamAnalytics(query),
          fetchPlanningAnalytics(query),
          fetchCapacityAnalytics(query),
          fetchOverdueAnalytics(query),
          fetchBlockedAnalytics(query),
          fetchLearningAnalytics(query),
          fetchLearningTrend(query),
          fetchSkillAnalytics(query),
          fetchEvidenceAnalytics(query),
          fetchWeeklyHistory(query),
        ]);

        if (isMounted) {
          setOverview(overviewRes);
          setExecutionTrend(execTrendRes);
          setProjects(projectsRes);
          setGoals(goalsRes);
          setWorkstreams(workstreamsRes);
          setPlanning(planningRes);
          setCapacity(capacityRes);
          setOverdue(overdueRes);
          setBlocked(blockedRes);
          setLearning(learningRes);
          setLearningTrend(learningTrendRes);
          setSkills(skillsRes);
          setEvidence(evidenceRes);
          setHistory(historyRes);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Failed to load analytics data.';
          setError(msg);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [period, customFrom, customTo]);

  return (
    <div id="analytics-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Personal Operating Intelligence</span>
            <span className="text-[10px] px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 font-extrabold uppercase tracking-wider">
              Deterministic Analytics
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Factual execution metrics, planning capacity, project outcomes, and continuous operational history.
          </p>
        </div>

        {/* Period Selector Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-lg">
          {(['day', 'week', 'month', 'quarter'] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              id={`period-btn-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            id="period-btn-custom"
            onClick={() => setPeriod('custom')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              period === 'custom'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom Range Picker */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md text-white">
          <span className="text-xs font-bold text-slate-400">Custom Date Range:</span>
          <input
            type="date"
            id="analytics-custom-from"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            id="analytics-custom-to"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Aggregating operating metrics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {!loading && !error && overview && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-blue-400 tracking-wider">Tasks Completed</span>
              <div className="text-2xl font-extrabold text-white">
                {overview.execution.completedTasks}
                <span className="text-xs text-slate-500 font-normal ml-1">/ {overview.execution.totalTasks}</span>
              </div>
              <div className="text-[11px] text-cyan-400 font-semibold">
                {overview.execution.completionRate !== null ? `${overview.execution.completionRate}% completion` : 'N/A'}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">Planned Capacity</span>
              <div className="text-2xl font-extrabold text-white">
                {Math.round(overview.planning.plannedMinutes / 60)}h
                <span className="text-xs text-slate-500 font-normal ml-1">
                  / {Math.round((capacity?.totalAvailableMinutes || 0) / 60)}h
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                {capacity?.utilizationPercentage !== null ? `${capacity?.utilizationPercentage}% utilized` : 'N/A'}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-purple-400 tracking-wider">Learning Logged</span>
              <div className="text-2xl font-extrabold text-white">
                {Math.round(overview.learning.learningMinutes / 60)}h
              </div>
              <div className="text-[11px] text-purple-400 font-semibold">
                {overview.learning.learningActivityDays} active days
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">Evidence Vault</span>
              <div className="text-2xl font-extrabold text-white">{overview.evidence.evidenceCreated}</div>
              <div className="text-[11px] text-amber-400 font-semibold">
                {overview.evidence.evidenceVerified} verified
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-indigo-400 tracking-wider">Active Projects</span>
              <div className="text-2xl font-extrabold text-white">{overview.projects.activeProjects}</div>
              <div className="text-[11px] text-slate-400 font-semibold">
                {overview.projects.completedProjects} completed
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl space-y-1.5 shadow-xl text-white relative overflow-hidden">
              <span className="text-[10px] uppercase font-extrabold text-rose-400 tracking-wider">Overdue Tasks</span>
              <div className="text-2xl font-extrabold text-rose-400">{overview.execution.overdueTasks}</div>
              <div className="text-[11px] text-amber-400 font-semibold">
                {blocked?.currentlyBlocked || 0} blocked
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
            {[
              { id: 'overview' as const, label: 'Overview & Trends' },
              { id: 'projects' as const, label: 'Projects & Goals' },
              { id: 'workstreams' as const, label: 'Workstreams' },
              { id: 'learning' as const, label: 'Learning & Skills' },
              { id: 'history' as const, label: 'Weekly History' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-md border border-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & TRENDS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Task Completion Trend Bar */}
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 tracking-wide">Execution Activity Trend</h3>
                  <span className="text-xs text-slate-500">{executionTrend.length} days analyzed</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end gap-1.5 h-32 pt-4 overflow-x-auto">
                    {executionTrend.map((pt) => {
                      const maxVal = Math.max(1, ...executionTrend.map((t) => t.completedTasks + t.createdTasks));
                      const compHeight = Math.round((pt.completedTasks / maxVal) * 100);
                      const createHeight = Math.round((pt.createdTasks / maxVal) * 100);

                      return (
                        <div
                          key={pt.date}
                          className="flex-1 min-w-[14px] flex flex-col items-center justify-end h-full gap-0.5 group relative"
                        >
                          <div
                            style={{ height: `${compHeight}%` }}
                            className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                            title={`${pt.date}: ${pt.completedTasks} completed`}
                          />
                          <div
                            style={{ height: `${createHeight}%` }}
                            className="w-full bg-slate-200 rounded-b hover:bg-slate-300 transition-colors"
                            title={`${pt.date}: ${pt.createdTasks} created`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{executionTrend[0]?.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span> Completed Tasks
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-slate-300 rounded-sm"></span> Created Tasks
                      </span>
                    </div>
                    <span>{executionTrend[executionTrend.length - 1]?.date}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Planning Breakdown */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-xs">
                  <h4 className="text-sm font-semibold text-slate-900">Planning & Scheduling</h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Days Planned</span>
                      <span className="font-semibold">{planning?.daysPlanned ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Time-blocked Days</span>
                      <span className="font-semibold">{planning?.daysWithTimeBlocks ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Task-linked Scheduled Mins</span>
                      <span className="font-semibold">{planning?.plannedTaskMinutes ?? 0}m</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Overhead / Routine Mins</span>
                      <span className="font-semibold">{planning?.tasklessPlannedMinutes ?? 0}m</span>
                    </div>
                  </div>
                </div>

                {/* Overdue Analysis */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-xs">
                  <h4 className="text-sm font-semibold text-slate-900">Overdue & Risk Analysis</h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Current Overdue Tasks</span>
                      <span className="font-semibold text-rose-600">{overdue?.currentOverdueTasks ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Became Overdue (Period)</span>
                      <span className="font-semibold">{overdue?.overdueCreatedDuringPeriod ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Resolved Overdue Tasks</span>
                      <span className="font-semibold text-emerald-600">{overdue?.overdueCompletedDuringPeriod ?? 0}</span>
                    </div>
                  </div>
                </div>

                {/* Blocked Analysis */}
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-3 shadow-xs">
                  <h4 className="text-sm font-semibold text-slate-900">Blocked Work Analysis</h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Currently Blocked</span>
                      <span className="font-semibold text-amber-600">{blocked?.currentlyBlocked ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Dependency-Blocked</span>
                      <span className="font-semibold">{blocked?.dependencyBlocked ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Manually Blocked</span>
                      <span className="font-semibold">{blocked?.manuallyBlocked ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS & GOALS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Projects Table */}
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900">Projects Analytics</h3>
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No active or completed projects.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Project</th>
                          <th className="py-2.5 px-3">Workstream</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-center">Tasks</th>
                          <th className="py-2.5 px-3 text-center">Completed</th>
                          <th className="py-2.5 px-3 text-center">Blocked</th>
                          <th className="py-2.5 px-3 text-center">Milestones</th>
                          <th className="py-2.5 px-3 text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects.map((p) => (
                          <tr key={p.projectId} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-900">{p.projectName}</td>
                            <td className="py-3 px-3 text-slate-500">{p.workstreamName || '—'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-700">{p.totalTasks}</td>
                            <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{p.completedTasks}</td>
                            <td className="py-3 px-3 text-center text-amber-600">{p.blockedTasks}</td>
                            <td className="py-3 px-3 text-center text-slate-500">
                              {p.milestonesCompleted} / {p.milestonesTotal}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-blue-600">
                              {p.completionPercentage !== null ? `${p.completionPercentage}%` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Goals Table */}
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900">Strategic Goals Analytics</h3>
                {goals.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No strategic goals created.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Goal</th>
                          <th className="py-2.5 px-3">Workstream</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-center">Projects</th>
                          <th className="py-2.5 px-3 text-center">Tasks</th>
                          <th className="py-2.5 px-3 text-right">Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {goals.map((g) => (
                          <tr key={g.goalId} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-900">{g.title}</td>
                            <td className="py-3 px-3 text-slate-500">{g.workstreamName || '—'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                                {g.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center text-slate-700">
                              {g.completedProjects} / {g.projectsTotal}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-700">
                              {g.completedTasks} / {g.tasksTotal}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-blue-600">
                              {g.progressPercentage !== null ? `${g.progressPercentage}%` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WORKSTREAMS */}
          {activeTab === 'workstreams' && (
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900">Workstream Resource & Output Allocation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workstreams.map((w) => (
                  <div key={w.workstreamId} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{w.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Weight: {w.priorityWeight}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-slate-500 text-[10px]">Goals</div>
                        <div className="font-semibold text-slate-900">{w.activeGoals} / {w.goalsCount}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-slate-500 text-[10px]">Projects</div>
                        <div className="font-semibold text-slate-900">{w.activeProjects} / {w.projectsCount}</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <div className="text-slate-500 text-[10px]">Tasks</div>
                        <div className="font-semibold text-emerald-600">{w.completedTasks} / {w.tasksCount}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Learning: {Math.round(w.learningMinutes / 60)}h</span>
                      <span>Evidence: {w.evidenceCount} records</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LEARNING & SKILLS */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              {/* Learning & Evidence Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs">
                  <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Learning Breakdown</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">Total Items</div>
                      <div className="font-semibold text-slate-900">{learning?.learningItemsTotal ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">Completed</div>
                      <div className="font-semibold text-emerald-600">{learning?.learningItemsCompleted ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">In Progress</div>
                      <div className="font-semibold text-sky-600">{learning?.learningItemsInProgress ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 p-4 rounded-xl space-y-2 shadow-xs">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Evidence Breakdown</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">Total Created</div>
                      <div className="font-semibold text-slate-900">{evidence?.evidenceCreated ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">Verified</div>
                      <div className="font-semibold text-emerald-600">{evidence?.evidenceVerified ?? 0}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                      <div className="text-slate-500 text-[10px]">Unverified</div>
                      <div className="font-semibold text-slate-500">{evidence?.evidenceUnverified ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Activity Trend */}
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900">Learning Activity Trend (Logged Minutes)</h3>
                <div className="flex items-end gap-1.5 h-24 pt-4 overflow-x-auto">
                  {learningTrend.map((pt) => {
                    const maxMins = Math.max(1, ...learningTrend.map((t) => t.minutes));
                    const barHeight = Math.round((pt.minutes / maxMins) * 100);

                    return (
                      <div key={pt.date} className="flex-1 min-w-[12px] flex flex-col items-center justify-end h-full">
                        <div
                          style={{ height: `${barHeight}%` }}
                          className="w-full bg-purple-600 rounded-t hover:bg-purple-700 transition-colors"
                          title={`${pt.date}: ${pt.minutes} mins`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills Table */}
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900">Skill Capabilities & Linked Artifacts</h3>
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4">No skills registered.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Skill</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Current Level</th>
                          <th className="py-2.5 px-3">Target Level</th>
                          <th className="py-2.5 px-3 text-center">Learning Items</th>
                          <th className="py-2.5 px-3 text-center">Projects</th>
                          <th className="py-2.5 px-3 text-center">Evidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {skills.map((s) => (
                          <tr key={s.skillId} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="py-3 px-3 text-slate-500">{s.category || 'General'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 border border-purple-200 text-purple-700 font-medium">
                                {s.currentLevel}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500">{s.targetLevel}</td>
                            <td className="py-3 px-3 text-center text-slate-700">{s.linkedLearningItems}</td>
                            <td className="py-3 px-3 text-center text-slate-700">{s.linkedProjects}</td>
                            <td className="py-3 px-3 text-center text-amber-600 font-semibold">{s.linkedEvidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: WEEKLY HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl space-y-4 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900">Historical Weekly Operating Snapshots</h3>
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No historical weekly plans found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Week</th>
                        <th className="py-2.5 px-3 text-center">Tasks Completed</th>
                        <th className="py-2.5 px-3 text-center">Overdue</th>
                        <th className="py-2.5 px-3 text-center">Planned Mins</th>
                        <th className="py-2.5 px-3 text-center">Learning Mins</th>
                        <th className="py-2.5 px-3 text-center">Evidence</th>
                        <th className="py-2.5 px-3 text-right">Review Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((h) => (
                        <tr key={h.weekStart} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {h.weekStart} to {h.weekEnd}
                          </td>
                          <td className="py-3 px-3 text-center text-emerald-600 font-semibold">{h.tasksCompleted}</td>
                          <td className="py-3 px-3 text-center text-rose-600">{h.tasksOverdue}</td>
                          <td className="py-3 px-3 text-center text-slate-700">{h.plannedMinutes}m</td>
                          <td className="py-3 px-3 text-center text-purple-700">{h.learningMinutes}m</td>
                          <td className="py-3 px-3 text-center text-amber-600">{h.evidenceCreated}</td>
                          <td className="py-3 px-3 text-right">
                            {h.reviewCompleted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Completed
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
