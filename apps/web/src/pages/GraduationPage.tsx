import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchGraduationOverview,
  updateGraduationSettings,
  initializeGraduationWorkspace,
} from '../features/graduation/api.js';
import type { GraduationOverviewDto } from '@kenenisa-os/shared';

export const GraduationPage: React.FC = () => {
  const [overview, setOverview] = useState<GraduationOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTargetDate, setEditingTargetDate] = useState(false);
  const [targetDateInput, setTargetDateInput] = useState('');
  const [savingTargetDate, setSavingTargetDate] = useState(false);
  const [savingInit, setSavingInit] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGraduationOverview();
      setOverview(data);
      if (data.graduationTargetDate) {
        setTargetDateInput(data.graduationTargetDate.slice(0, 10));
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load graduation overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTargetDate = async () => {
    try {
      setSavingTargetDate(true);
      await updateGraduationSettings({
        graduationTargetDate: targetDateInput ? targetDateInput : null,
      });
      setEditingTargetDate(false);
      await loadData();
    } catch (err: any) {
      alert(`Error updating target date: ${err.message}`);
    } finally {
      setSavingTargetDate(false);
    }
  };

  const handleSyncWorkspace = async () => {
    try {
      setSavingInit(true);
      await initializeGraduationWorkspace();
      await loadData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setSavingInit(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading Graduation Command Center...</p>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="text-lg font-semibold mb-2">Error Loading Graduation Data</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    university,
    academicYear,
    level,
    currentSemester,
    graduationTargetDate,
    overallAcademicStatus,
    activeProjects,
    availableCapacityMinutes,
    weeklyCompletionStats,
    progressBreakdown,
    criticalAttention,
    todayExecution,
  } = overview!;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* SECTION A: TOP HEADER & OVERVIEW */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                ASTU P0 PRIORITY
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {overallAcademicStatus}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Graduation Command Center
            </h1>
            <p className="text-sm text-slate-500">
              Personal operating center for completing academic obligations, graduation projects, and professional readiness.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncWorkspace}
              disabled={savingInit}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors border border-slate-200/60 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${savingInit ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {savingInit ? 'Synchronizing...' : 'Sync Workspace'}
            </button>
            <Link
              to="/app/academics"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Manage Courses</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Academic Profile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">University</div>
            <div className="text-sm font-semibold text-slate-800 line-clamp-1" title={university}>{university}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Academic Year</div>
            <div className="text-sm font-semibold text-slate-800">{academicYear}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Level & Semester</div>
            <div className="text-sm font-semibold text-slate-800">{level} • {currentSemester}</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Graduation Target</div>
            {editingTargetDate ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="date"
                  value={targetDateInput}
                  onChange={(e) => setTargetDateInput(e.target.value)}
                  className="w-full text-xs p-1 border border-blue-400 rounded bg-white text-slate-800 focus:outline-none"
                />
                <button
                  onClick={handleSaveTargetDate}
                  disabled={savingTargetDate}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingTargetDate(false)}
                  className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <span className="text-sm font-semibold text-slate-800">
                  {graduationTargetDate ? new Date(graduationTargetDate).toLocaleDateString() : 'Not configured'}
                </span>
                <button
                  onClick={() => setEditingTargetDate(true)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:underline transition-opacity ml-1"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Daily Capacity</div>
            <div className="text-sm font-semibold text-slate-800">{availableCapacityMinutes} min / day</div>
          </div>

          <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Weekly Throughput</div>
            <div className="text-sm font-semibold text-slate-800">
              {weeklyCompletionStats.completedTasks} done ({weeklyCompletionStats.completionRate}%)
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: GRADUATION PROGRESS BREAKDOWN */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Graduation Progress Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic calculations computed directly from verified database records.
            </p>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
            No Fabricated Percentages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {/* 1. Academic Requirements */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">1. Academics</span>
                <span className="text-base font-bold text-blue-600">
                  {progressBreakdown.academicRequirements.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressBreakdown.academicRequirements.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {progressBreakdown.academicRequirements.completed} of {progressBreakdown.academicRequirements.total} Courses
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 italic block leading-snug">
                Basis: {progressBreakdown.academicRequirements.basis}
              </span>
            </div>
          </div>

          {/* 2. Individual Project */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">2. Individual Proj</span>
                <span className="text-base font-bold text-indigo-600">
                  {progressBreakdown.individualProject.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressBreakdown.individualProject.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {progressBreakdown.individualProject.completedMilestones} of {progressBreakdown.individualProject.totalMilestones} Milestones
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 italic block leading-snug">
                Basis: {progressBreakdown.individualProject.basis}
              </span>
            </div>
          </div>

          {/* 3. Group Project */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">3. Group Proj</span>
                <span className="text-base font-bold text-purple-600">
                  {progressBreakdown.groupProject.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressBreakdown.groupProject.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {progressBreakdown.groupProject.completedMilestones} of {progressBreakdown.groupProject.totalMilestones} Milestones
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 italic block leading-snug">
                Basis: {progressBreakdown.groupProject.basis}
              </span>
            </div>
          </div>

          {/* 4. Final Documentation */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">4. Documentation</span>
                <span className="text-base font-bold text-emerald-600">
                  {progressBreakdown.finalDocumentation.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressBreakdown.finalDocumentation.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {progressBreakdown.finalDocumentation.completed} of {progressBreakdown.finalDocumentation.total} Milestones
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 italic block leading-snug">
                Basis: {progressBreakdown.finalDocumentation.basis}
              </span>
            </div>
          </div>

          {/* 5. Defense Preparation */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase text-slate-500">5. Defense Prep</span>
                <span className="text-base font-bold text-amber-600">
                  {progressBreakdown.defensePreparation.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressBreakdown.defensePreparation.percent}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {progressBreakdown.defensePreparation.completed} of {progressBreakdown.defensePreparation.total} Checkpoints
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 italic block leading-snug">
                Basis: {progressBreakdown.defensePreparation.basis}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C & D: CRITICAL ATTENTION & TODAY'S EXECUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Attention Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900">Critical Attention Panel</h3>
              </div>
              <span className="text-xs text-slate-500">
                {criticalAttention.overdueTasks.length +
                  criticalAttention.tasksDueSoon.length +
                  criticalAttention.blockedTasks.length +
                  criticalAttention.delayedMilestones.length}{' '}
                items
              </span>
            </div>

            {criticalAttention.overdueTasks.length === 0 &&
            criticalAttention.tasksDueSoon.length === 0 &&
            criticalAttention.blockedTasks.length === 0 &&
            criticalAttention.delayedMilestones.length === 0 ? (
              <div className="py-12 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-semibold text-slate-700">No Critical Blockers</p>
                <p className="text-xs text-slate-500 mt-0.5">All graduation obligations are currently on track.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {criticalAttention.overdueTasks.map((task) => (
                  <Link
                    key={task.id}
                    to="/app/tasks"
                    className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between hover:bg-rose-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-rose-200 text-rose-800 rounded">
                        OVERDUE
                      </span>
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{task.title}</span>
                    </div>
                    <span className="text-xs text-rose-600 font-medium">Due {new Date(task.dueDate!).toLocaleDateString()}</span>
                  </Link>
                ))}

                {criticalAttention.blockedTasks.map((task) => (
                  <Link
                    key={task.id}
                    to="/app/tasks"
                    className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-200 text-amber-800 rounded">
                        BLOCKED
                      </span>
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{task.title}</span>
                    </div>
                    <span className="text-xs text-amber-700 font-medium">Needs resolution</span>
                  </Link>
                ))}

                {criticalAttention.delayedMilestones.map((ms) => (
                  <Link
                    key={ms.id}
                    to="/app/milestones"
                    className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl flex items-center justify-between hover:bg-orange-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-orange-200 text-orange-800 rounded">
                        MILESTONE DELAY
                      </span>
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{ms.name}</span>
                    </div>
                    <span className="text-xs text-orange-700 font-medium">{ms.projectName}</span>
                  </Link>
                ))}

                {criticalAttention.tasksDueSoon.map((task) => (
                  <Link
                    key={task.id}
                    to="/app/tasks"
                    className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between hover:bg-blue-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-200 text-blue-800 rounded">
                        DUE SOON
                      </span>
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">{task.title}</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Due {new Date(task.dueDate!).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct navigation to affected entities</span>
            <Link to="/app/tasks" className="text-blue-600 font-medium hover:underline">
              View All Tasks →
            </Link>
          </div>
        </div>

        {/* Today's Execution Panel */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Today's Execution Panel</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                Capacity: {todayExecution.availableCapacityMinutes} min
              </span>
            </div>

            {/* Next Best Action Card */}
            {todayExecution.nextBestAction ? (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Recommended Next Best Action (Score {todayExecution.nextBestAction.score})
                  </span>
                  <span className="text-xs font-bold text-blue-700">{todayExecution.nextBestAction.priority}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{todayExecution.nextBestAction.title}</h4>
                <div className="mt-3 flex items-center justify-end">
                  <Link
                    to="/app/tasks"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    Execute Task Now →
                  </Link>
                </div>
              </div>
            ) : null}

            {/* In-Progress Task */}
            {todayExecution.currentInProgressTask ? (
              <div className="mb-4 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Currently In Progress
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    {todayExecution.currentInProgressTask.estimateMinutes || 30} min estimate
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {todayExecution.currentInProgressTask.title}
                </div>
              </div>
            ) : null}

            {/* Today's Tasks list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>SCHEDULED TODAY ({todayExecution.scheduledTasks.length})</span>
                <span>
                  {todayExecution.completedWorkCount} done / {todayExecution.remainingWorkCount} remaining
                </span>
              </div>
              {todayExecution.scheduledTasks.length === 0 ? (
                <div className="py-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">No tasks explicitly scheduled for today yet.</p>
                  <Link
                    to="/app/tasks"
                    className="mt-1.5 inline-block text-xs font-medium text-blue-600 hover:underline"
                  >
                    + Schedule Next Task
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {todayExecution.scheduledTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800 line-clamp-1">{t.title}</span>
                      <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Deterministic NBA prioritization</span>
            <Link to="/app/planning" className="text-blue-600 font-medium hover:underline">
              Open Daily Planner →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION E: TWO GRADUATION PROJECT WORKSPACES */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Graduation Project Workspaces</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Two parallel graduation projects: Individual & Collaborative Group with 15 verified engineering milestones each.
            </p>
          </div>
          <Link
            to="/app/projects"
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>All Projects Directory</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeProjects.map((project, idx) => (
            <div
              key={project.id}
              className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    {idx === 0 ? 'PROJECT A — INDIVIDUAL' : 'PROJECT B — GROUP'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200/70">
                    {project.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{project.name}</h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {idx === 0
                    ? 'Investigate a real problem, benchmark international solutions, validate Ethiopian context, develop technically strong solution, conduct experiments, and evaluate results.'
                    : 'Collaborative engineering project, divide responsibilities, develop integrated architecture, and demonstrate unified results.'}
                </p>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Milestone Progress</span>
                    <span className="text-blue-600">
                      {project.completedMilestones} / {project.totalMilestones} ({project.progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">15 Configurable Milestones</span>
                <Link
                  to="/app/milestones"
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-lg transition-colors shadow-2xs"
                >
                  Manage Milestones →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
