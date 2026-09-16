import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchDailyPlanningOverview,
  fetchWeeklyPlanningOverview,
  createDailyPlan,
  updateDailyPlan,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  createWeeklyPlan,
  updateWeeklyPlan,
} from '../features/planning/api.js';
import {
  DailyPlanningResponseDto,
  WeeklyPlanningResponseDto,
  TimeBlockDto,
  TaskDto,
} from '@kenenisa-os/shared';

export const PlanningPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const [dailyData, setDailyData] = useState<DailyPlanningResponseDto | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyPlanningResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlockDto | null>(null);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockTaskId, setBlockTaskId] = useState<string>('');
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('10:00');
  const [blockNotes, setBlockNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Must-win selection modal
  const [isMustWinModalOpen, setIsMustWinModalOpen] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [weeklyTheme, setWeeklyTheme] = useState('');
  const [weeklyNotes, setWeeklyNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (viewMode === 'daily') {
        const res = await fetchDailyPlanningOverview(selectedDate);
        setDailyData(res);
        setNotesText(res.plan?.notes || '');
      } else {
        const res = await fetchWeeklyPlanningOverview(selectedDate);
        setWeeklyData(res);
        setWeeklyTheme(res.plan?.theme || '');
        setWeeklyNotes(res.plan?.notes || '');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load planning data');
    } finally {
      setLoading(false);
    }
  }, [viewMode, selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Date Navigation Helpers
  const shiftDays = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const newStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(newStr);
  };

  const resetToToday = () => {
    const now = new Date();
    setSelectedDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    );
  };

  // Open TimeBlock Modal
  const handleOpenCreateBlock = (preselectedTask?: TaskDto) => {
    setEditingBlock(null);
    setBlockTitle(preselectedTask ? preselectedTask.title : '');
    setBlockTaskId(preselectedTask ? preselectedTask.id : '');
    setBlockStartTime('09:00');
    setBlockEndTime('10:00');
    setBlockNotes('');
    setModalError(null);
    setIsTimeBlockModalOpen(true);
  };

  const handleOpenEditBlock = (block: TimeBlockDto) => {
    setEditingBlock(block);
    setBlockTitle(block.title);
    setBlockTaskId(block.taskId || '');
    const start = new Date(block.startAt);
    const end = new Date(block.endAt);
    setBlockStartTime(`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    setBlockEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    setBlockNotes(block.notes || '');
    setModalError(null);
    setIsTimeBlockModalOpen(true);
  };

  const handleSaveTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setModalError(null);

      const [sHour, sMin] = blockStartTime.split(':').map(Number);
      const [eHour, eMin] = blockEndTime.split(':').map(Number);

      const [year, month, day] = selectedDate.split('-').map(Number);
      const startAtDate = new Date(year, month - 1, day, sHour, sMin, 0, 0);
      const endAtDate = new Date(year, month - 1, day, eHour, eMin, 0, 0);

      if (startAtDate >= endAtDate) {
        setModalError('Start time must be strictly before end time');
        setSubmitting(false);
        return;
      }

      if (editingBlock) {
        await updateTimeBlock(editingBlock.id, {
          title: blockTitle,
          taskId: blockTaskId || null,
          startAt: startAtDate.toISOString(),
          endAt: endAtDate.toISOString(),
          notes: blockNotes || null,
        });
      } else {
        await createTimeBlock({
          dailyPlanId: dailyData?.plan?.id || null,
          taskId: blockTaskId || null,
          title: blockTitle,
          startAt: startAtDate.toISOString(),
          endAt: endAtDate.toISOString(),
          notes: blockNotes || null,
        });
      }

      setIsTimeBlockModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to save time block');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time block?')) return;
    try {
      await deleteTimeBlock(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete time block');
    }
  };

  const handleSelectMustWinTask = async (taskId: string) => {
    try {
      if (dailyData?.plan) {
        await updateDailyPlan(selectedDate, { mustWinTaskId: taskId });
      } else {
        await createDailyPlan({ date: selectedDate, mustWinTaskId: taskId });
      }
      setIsMustWinModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to set must-win task');
    }
  };

  const handleSaveDailyNotes = async () => {
    try {
      if (dailyData?.plan) {
        await updateDailyPlan(selectedDate, { notes: notesText });
      } else {
        await createDailyPlan({ date: selectedDate, notes: notesText });
      }
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save notes');
    }
  };

  const handleSaveWeeklyPlan = async () => {
    try {
      if (weeklyData?.plan) {
        await updateWeeklyPlan(weeklyData.weekStart, { theme: weeklyTheme, notes: weeklyNotes });
      } else {
        await createWeeklyPlan({ weekStart: weeklyData?.weekStart || selectedDate, theme: weeklyTheme, notes: weeklyNotes });
      }
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save weekly plan');
    }
  };

  if (loading && !dailyData && !weeklyData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]" id="planning-loading">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Initializing Planning Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12" id="planning-workspace">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 border border-[#3AB1EC]/30 text-[#0284c7] uppercase tracking-wider">
              Step 7 Engine
            </span>
            <span className="text-xs text-slate-500 font-semibold">Capacity & Scheduling</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Planning Workspace</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Daily vs Weekly Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="view-daily-btn"
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'daily'
                  ? 'bg-[#3B82F6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
            <button
              id="view-weekly-btn"
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'weekly'
                  ? 'bg-[#3B82F6] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly View
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              id="prev-date-btn"
              onClick={() => shiftDays(viewMode === 'daily' ? -1 : -7)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all font-bold text-xs"
            >
              &lt;
            </button>
            <button
              id="today-date-btn"
              onClick={resetToToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
            >
              {viewMode === 'daily' ? selectedDate : `Week: ${weeklyData?.weekStart || selectedDate}`}
            </button>
            <button
              id="next-date-btn"
              onClick={() => shiftDays(viewMode === 'daily' ? 1 : 7)}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-all font-bold text-xs"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-xs text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* ── DAILY VIEW ─────────────────────────────────────────────────────────── */}
      {viewMode === 'daily' && dailyData && (
        <div className="space-y-8" id="daily-planning-view">
          {/* Must-Win Task Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden" id="must-win-banner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284c7] bg-sky-50 border border-[#3AB1EC]/30 px-2.5 py-0.5 rounded">
                  TODAY&apos;S MUST-WIN TASK
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2" id="must-win-title">
                  {dailyData.mustWinTask ? dailyData.mustWinTask.title : 'No Must-Win Task Selected'}
                </h2>
                {dailyData.mustWinTask?.project && (
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Project: {dailyData.mustWinTask.project.name} • Priority: {dailyData.mustWinTask.priority}
                  </p>
                )}
              </div>

              <button
                id="select-must-win-btn"
                onClick={() => setIsMustWinModalOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
              >
                {dailyData.mustWinTask ? 'Change Must-Win' : 'Select Must-Win Task'}
              </button>
            </div>
          </div>

          {/* Capacity Engine Progress Bar */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs" id="capacity-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Daily Planning Capacity</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {Math.floor(dailyData.capacity.plannedMinutes / 60)}h {dailyData.capacity.plannedMinutes % 60}m planned out of {Math.floor(dailyData.capacity.capacityMinutes / 60)}h available
                </p>
              </div>

              <div className="flex items-center gap-3">
                {dailyData.capacity.overCapacity && (
                  <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-[#c2410c] text-xs font-bold rounded-full animate-pulse" id="over-capacity-badge">
                    OVER CAPACITY (+{dailyData.capacity.plannedMinutes - dailyData.capacity.capacityMinutes}m)
                  </span>
                )}
                <span className="text-lg font-black text-[#0284c7]" id="capacity-percentage">
                  {dailyData.capacity.utilizationPercent ?? 0}% Utilized
                </span>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  dailyData.capacity.overCapacity
                    ? 'bg-gradient-to-r from-[#FF5A00] to-amber-500'
                    : 'bg-gradient-to-r from-[#3AB1EC] to-[#3B82F6]'
                }`}
                style={{ width: `${Math.min(100, dailyData.capacity.utilizationPercent || 0)}%` }}
              />
            </div>
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 cols): Time Block Schedule */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs" id="schedule-section">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Schedule Timeline</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Planned time allocations for {selectedDate}</p>
                  </div>

                  <button
                    id="add-time-block-btn"
                    onClick={() => handleOpenCreateBlock()}
                    className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    + Add Time Block
                  </button>
                </div>

                {dailyData.timeBlocks.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs" id="empty-blocks">
                    No time blocks scheduled for this date yet.
                  </div>
                ) : (
                  <div className="space-y-3" id="time-blocks-list">
                    {dailyData.timeBlocks.map((block) => {
                      const start = new Date(block.startAt);
                      const end = new Date(block.endAt);
                      const startFmt = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                      const endFmt = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

                      return (
                        <div
                          key={block.id}
                          className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="text-[#0284c7] font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 shadow-xs">
                              {startFmt} – {endFmt}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">{block.title}</h4>
                              {block.task && (
                                <p className="text-xs text-slate-600 truncate font-medium">
                                  Task: {block.task.title}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-200/80 text-slate-700 border border-slate-300">
                              {block.status}
                            </span>
                            <button
                              onClick={() => handleOpenEditBlock(block)}
                              className="p-1.5 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { void handleDeleteBlock(block.id); }}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes Area */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs" id="daily-notes-section">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Daily Planning Notes</h3>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record intentional daily planning notes..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none"
                />
                <button
                  id="save-daily-notes-btn"
                  onClick={() => { void handleSaveDailyNotes(); }}
                  className="mt-3 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Save Daily Notes
                </button>
              </div>
            </div>

            {/* Right Column (1 col): Unscheduled Ready Tasks */}
            <div className="space-y-6" id="unscheduled-tasks-section">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Unscheduled Executable Work</h3>
                <p className="text-xs text-slate-600 mb-4 font-medium">Ready tasks lacking scheduled time blocks</p>

                {dailyData.unscheduledReadyTasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs">
                    All ready tasks are scheduled!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailyData.unscheduledReadyTasks.map((task) => (
                      <div key={task.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold bg-sky-50 border border-[#3AB1EC]/30 text-[#0284c7] px-2 py-0.5 rounded">
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleOpenCreateBlock(task)}
                            className="text-xs text-[#2563eb] font-bold hover:underline"
                          >
                            + Schedule
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate">{task.title}</h4>
                        {task.project && (
                          <p className="text-[11px] text-slate-600 mt-1 truncate font-medium">{task.project.name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WEEKLY VIEW ────────────────────────────────────────────────────────── */}
      {viewMode === 'weekly' && weeklyData && (
        <div className="space-y-8" id="weekly-planning-view">
          {/* Weekly Capacity Header */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs" id="weekly-capacity-section">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Weekly Planning Horizon</h2>
                <p className="text-xs text-slate-600 font-medium">
                  {weeklyData.weekStart} to {weeklyData.weekEnd} • {Math.floor(weeklyData.capacity.plannedMinutes / 60)}h planned / {Math.floor(weeklyData.capacity.capacityMinutes / 60)}h available
                </p>
              </div>

              <span className="text-xl font-black text-[#0284c7]">
                {weeklyData.capacity.utilizationPercent ?? 0}% Weekly Utilization
              </span>
            </div>

            {/* 7-Day Capacity Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mt-4" id="weekly-daily-breakdown">
              {weeklyData.capacity.dailyBreakdown.map((day) => (
                <div key={day.date} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4">
                  <div className="text-xs font-bold text-slate-600 mb-1">{day.date}</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {Math.floor(day.plannedMinutes / 60)}h {day.plannedMinutes % 60}m
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">
                    {day.utilizationPercent ?? 0}% Utilized
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${day.overCapacity ? 'bg-[#FF5A00]' : 'bg-[#3AB1EC]'}`}
                      style={{ width: `${Math.min(100, day.utilizationPercent || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme & Notes Editor */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs" id="weekly-theme-section">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Intentional Focus Theme</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Theme</label>
                <input
                  type="text"
                  value={weeklyTheme}
                  onChange={(e) => setWeeklyTheme(e.target.value)}
                  placeholder="e.g. Complete Step 7 Architecture & Master Planning Engine"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Notes</label>
                <textarea
                  value={weeklyNotes}
                  onChange={(e) => setWeeklyNotes(e.target.value)}
                  placeholder="Record strategic weekly guidance..."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 focus:outline-none"
                />
              </div>

              <button
                id="save-weekly-plan-btn"
                onClick={() => { void handleSaveWeeklyPlan(); }}
                className="px-4 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Save Weekly Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TIME BLOCK MODAL ────────────────────────────────────────────────────── */}
      {isTimeBlockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="time-block-modal">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingBlock ? 'Edit Time Block' : 'Create Time Block'}
            </h3>

            {modalError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-semibold" id="time-block-modal-error">
                {modalError}
              </div>
            )}

            <form onSubmit={(e) => { void handleSaveTimeBlock(e); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="e.g. Implement Planning Controller"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#6366F1] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#6366F1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:border-[#6366F1] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTimeBlockModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MUST-WIN TASK SELECTION MODAL ────────────────────────────────────── */}
      {isMustWinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="must-win-modal">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Select Must-Win Task for {selectedDate}</h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {dailyData?.unscheduledReadyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => { void handleSelectMustWinTask(task.id); }}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                    {task.project && (
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{task.project.name}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold bg-sky-50 border border-[#3AB1EC]/30 text-[#0284c7] px-2 py-0.5 rounded">
                    Select
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsMustWinModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
