import React, { useEffect, useState, useCallback } from 'react';
import {
  fetchMultiHorizonOverview,
  fetchDailyFactualSummary,
  fetchDailyPlanningOverview,
  fetchWeeklyPlanningOverview,
  fetchMonthPlans,
  fetchOutcomes,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  createOutcome,
  confirmOutcome,
} from '../features/planning/api.js';
import {
  DailyPlanningResponseDto,
  WeeklyPlanningResponseDto,
  TimeBlockDto,
  MonthPlanDto,
  PlanOutcomeDto,
  MultiHorizonOverviewDto,
  PlanOutcomeState,
} from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { useToast } from '../components/ui/Toast.js';

export const PlanningPage: React.FC = () => {
  const { showToast } = useToast();
  const [horizon, setHorizon] = useState<'year' | 'month' | 'week' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const [overviewData, setOverviewData] = useState<MultiHorizonOverviewDto | null>(null);
  const [dailyData, setDailyData] = useState<DailyPlanningResponseDto | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyPlanningResponseDto | null>(null);
  const [monthPlans, setMonthPlans] = useState<MonthPlanDto[]>([]);
  const [outcomes, setOutcomes] = useState<PlanOutcomeDto[]>([]);
  const [factualSummary, setFactualSummary] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Outcome Creation Modal
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [outcomeTitle, setOutcomeTitle] = useState('');
  const [outcomeDesc, setOutcomeDesc] = useState('');
  const [outcomeExpectedResult, setOutcomeExpectedResult] = useState('');
  const [outcomePriority, setOutcomePriority] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2');
  const [outcomePlannedMinutes, setOutcomePlannedMinutes] = useState<number>(60);
  const [submitting, setSubmitting] = useState(false);

  // TimeBlock Modal
  const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlockDto | null>(null);
  const [blockTitle, setBlockTitle] = useState('');
  const [blockTaskId, setBlockTaskId] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('09:00');
  const [blockEndTime, setBlockEndTime] = useState('10:00');
  const [blockNotes, setBlockNotes] = useState('');

  // Outcome Confirmation Modal
  const [confirmingOutcome, setConfirmingOutcome] = useState<PlanOutcomeDto | null>(null);
  const [confirmState, setConfirmState] = useState<PlanOutcomeState>('COMPLETED');
  const [confirmActualResult, setConfirmActualResult] = useState('');
  const [confirmExplanation, setConfirmExplanation] = useState('');

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovRes, dailyRes, weeklyRes, monthRes, outcomesRes] = await Promise.all([
        fetchMultiHorizonOverview(selectedDate),
        fetchDailyPlanningOverview(selectedDate),
        fetchWeeklyPlanningOverview(selectedDate),
        fetchMonthPlans(),
        fetchOutcomes(),
      ]);

      setOverviewData(ovRes);
      setDailyData(dailyRes);
      setWeeklyData(weeklyRes);
      setMonthPlans(monthRes);
      setOutcomes(outcomesRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load multi-horizon planning data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Handle Date Navigation
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

  // Generate Daily Factual Summary
  const handleGenerateFactualSummary = async () => {
    try {
      const res = await fetchDailyFactualSummary(selectedDate);
      setFactualSummary(res.summary);
      showToast('Daily factual summary generated', 'info');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to generate summary', 'error');
    }
  };

  // Create Outcome
  const handleCreateOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeTitle.trim()) return;

    try {
      setSubmitting(true);
      const horizonUpper = horizon.toUpperCase() as 'YEARLY' | 'MONTHLY' | 'WEEKLY' | 'DAILY';
      await createOutcome({
        horizon: horizonUpper,
        title: outcomeTitle.trim(),
        description: outcomeDesc.trim() || undefined,
        expectedResult: outcomeExpectedResult.trim() || undefined,
        priority: outcomePriority,
        plannedMinutes: outcomePlannedMinutes,
        dailyPlanId: horizon === 'day' ? dailyData?.plan?.id || undefined : undefined,
        weeklyPlanId: horizon === 'week' ? weeklyData?.plan?.id || undefined : undefined,
      });

      showToast('Plan outcome created successfully', 'success');
      setIsOutcomeModalOpen(false);
      setOutcomeTitle('');
      setOutcomeDesc('');
      setOutcomeExpectedResult('');
      await loadAllData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create outcome', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // User Confirmation of Outcome
  const handleConfirmOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingOutcome) return;

    try {
      setSubmitting(true);
      await confirmOutcome(
        confirmingOutcome.id,
        confirmState,
        confirmActualResult.trim() || undefined,
        confirmExplanation.trim() || undefined,
      );
      showToast('Outcome result confirmed', 'success');
      setConfirmingOutcome(null);
      await loadAllData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to confirm outcome', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // TimeBlock Save
  const handleSaveTimeBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;

    try {
      setSubmitting(true);
      const startIso = `${selectedDate}T${blockStartTime}:00.000Z`;
      const endIso = `${selectedDate}T${blockEndTime}:00.000Z`;

      if (editingBlock) {
        await updateTimeBlock(editingBlock.id, {
          title: blockTitle.trim(),
          taskId: blockTaskId || null,
          startAt: startIso,
          endAt: endIso,
          notes: blockNotes.trim() || null,
        });
        showToast('Time block updated', 'success');
      } else {
        await createTimeBlock({
          dailyPlanId: dailyData?.plan?.id || null,
          taskId: blockTaskId || null,
          title: blockTitle.trim(),
          startAt: startIso,
          endAt: endIso,
          notes: blockNotes.trim() || null,
        });
        showToast('Time block created', 'success');
      }

      setIsTimeBlockModalOpen(false);
      await loadAllData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save time block', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTimeBlock = async (id: string) => {
    try {
      await deleteTimeBlock(id);
      showToast('Time block deleted', 'info');
      await loadAllData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete time block', 'error');
    }
  };

  // Badge Color Helper
  const getOutcomeBadge = (state: PlanOutcomeState) => {
    switch (state) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Completed</span>;
      case 'PARTIALLY_COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">🟡 Partially Completed</span>;
      case 'MISSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">🔴 Missed</span>;
      case 'BLOCKED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">🟠 Blocked</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">🔵 In Progress</span>;
      case 'RESCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">↪ Rescheduled</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">⚫ Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">⚪ Planned</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans" id="multi-horizon-planning">
      <PageHeader
        title="Multi-Horizon Planning & Automatic Outcome Tracking"
        description="Plan, schedule, execute, and objectively track outcomes across Year, Month, Week, and Day horizons."
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateFactualSummary}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs sm:text-sm font-bold transition shadow-2xs"
          >
            📊 Generate Factual Summary
          </button>
          <button
            onClick={() => setIsOutcomeModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition shadow-sm active:scale-95"
          >
            + Add Planned Outcome
          </button>
        </div>
      </PageHeader>

      {/* Horizon Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto custom-scrollbar flex-nowrap w-full sm:w-auto pb-1 sm:pb-0">
          {(['year', 'month', 'week', 'day'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold capitalize whitespace-nowrap transition cursor-pointer ${
                horizon === h
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {h === 'year' && '🗓️ Yearly'}
              {h === 'month' && '📅 Monthly'}
              {h === 'week' && '📆 Weekly'}
              {h === 'day' && '⏱️ Daily'}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto custom-scrollbar flex-nowrap w-full sm:w-auto">
          <button
            onClick={() => shiftDays(-1)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            ‹ Prev
          </button>
          <span className="text-xs sm:text-sm font-mono font-extrabold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900 whitespace-nowrap shadow-2xs">
            {selectedDate}
          </span>
          <button
            onClick={() => shiftDays(1)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            Next ›
          </button>
          <button
            onClick={resetToToday}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Factual Summary Banner */}
      {factualSummary && (
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 border border-indigo-200 rounded-2xl p-5 shadow-xs relative">
          <button
            onClick={() => setFactualSummary(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            ✕
          </button>
          <h3 className="text-sm font-extrabold text-indigo-900 mb-2">Generated Factual Daily Summary</h3>
          <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
            {factualSummary}
          </pre>
        </div>
      )}

      {/* HORIZON VIEWS */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading planning horizons...</div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">{error}</div>
      ) : (
        <>
          {/* YEAR VIEW */}
          {horizon === 'year' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 p-6 rounded-3xl col-span-2 shadow-xs space-y-3">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {overviewData?.activeYearPlan ? overviewData.activeYearPlan.title : `Yearly Direction (${selectedDate.split('-')[0]})`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {overviewData?.activeYearPlan?.description || 'Strategic direction and long-term milestones for this calendar year.'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">EXPECTED OUTCOMES</span>
                      <span className="text-slate-800 font-semibold">{overviewData?.activeYearPlan?.expectedOutcomes || 'Strategic targets defined.'}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">ACTUAL OBSERVED OUTCOMES</span>
                      <span className="text-emerald-700 font-bold">{overviewData?.activeYearPlan?.actualOutcomes || 'Tracking in progress.'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-xs space-y-3">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Yearly Stats</h4>
                  <div className="space-y-3 text-xs sm:text-sm pt-1">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-600 font-medium">Total Month Plans</span>
                      <span className="font-mono font-black text-blue-600">{monthPlans.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-600 font-medium">Active Year Horizon</span>
                      <span className="font-mono font-black text-emerald-600">{selectedDate.split('-')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yearly Outcomes Table */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Yearly Planned Outcomes</h4>
                <div className="space-y-3">
                  {outcomes.filter((o) => o.horizon === 'YEARLY').length === 0 ? (
                    <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                      No yearly outcomes planned yet. Click "+ Add Planned Outcome" to create one.
                    </div>
                  ) : (
                    outcomes
                      .filter((o) => o.horizon === 'YEARLY')
                      .map((o) => (
                        <div key={o.id} className="p-4 bg-slate-50/80 hover:bg-blue-50/20 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{o.title}</span>
                              {getOutcomeBadge(o.outcomeState)}
                            </div>
                            {o.expectedResult && <p className="text-xs text-slate-500 mt-1">Expected: {o.expectedResult}</p>}
                            {o.actualResult && <p className="text-xs text-emerald-700 font-semibold mt-0.5">Actual: {o.actualResult}</p>}
                          </div>
                          <button
                            onClick={() => setConfirmingOutcome(o)}
                            className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto cursor-pointer"
                          >
                            Update Result
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MONTH VIEW */}
          {horizon === 'month' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-xs space-y-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {overviewData?.activeMonthPlan ? overviewData.activeMonthPlan.title : `Monthly Target (${selectedDate.split('-')[0]}-${selectedDate.split('-')[1]})`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {overviewData?.activeMonthPlan?.description || 'Monthly objectives inherited from Yearly Direction.'}
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Monthly Outcomes</h4>
                <div className="space-y-3">
                  {outcomes.filter((o) => o.horizon === 'MONTHLY').length === 0 ? (
                    <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                      No monthly outcomes recorded for this period.
                    </div>
                  ) : (
                    outcomes
                      .filter((o) => o.horizon === 'MONTHLY')
                      .map((o) => (
                        <div key={o.id} className="p-4 bg-slate-50/80 hover:bg-blue-50/20 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{o.title}</span>
                              {getOutcomeBadge(o.outcomeState)}
                            </div>
                            {o.expectedResult && <p className="text-xs text-slate-500 mt-1">Expected: {o.expectedResult}</p>}
                            {o.actualResult && <p className="text-xs text-emerald-700 font-semibold mt-0.5">Actual: {o.actualResult}</p>}
                          </div>
                          <button
                            onClick={() => setConfirmingOutcome(o)}
                            className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto cursor-pointer"
                          >
                            Update Result
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {horizon === 'week' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 p-6 rounded-3xl col-span-2 shadow-xs space-y-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Weekly Focus ({weeklyData?.weekStart} to {weeklyData?.weekEnd})
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-700 font-semibold font-mono">
                    Theme: {weeklyData?.plan?.theme || 'No theme specified'}
                  </p>
                </div>
                <div className="bg-white border border-slate-200/90 p-6 rounded-3xl shadow-xs space-y-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity Load</h4>
                  <div className="text-2xl font-black font-mono text-blue-600">
                    {weeklyData?.capacity ? `${weeklyData.capacity.plannedMinutes} / ${weeklyData.capacity.capacityMinutes} min` : '2400 min'}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-base font-extrabold text-slate-900 tracking-tight">Weekly Outcomes</h4>
                <div className="space-y-3">
                  {outcomes.filter((o) => o.horizon === 'WEEKLY').length === 0 ? (
                    <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                      No weekly outcomes configured.
                    </div>
                  ) : (
                    outcomes
                      .filter((o) => o.horizon === 'WEEKLY')
                      .map((o) => (
                        <div key={o.id} className="p-4 bg-slate-50/80 hover:bg-blue-50/20 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm">{o.title}</span>
                              {getOutcomeBadge(o.outcomeState)}
                            </div>
                          </div>
                          <button
                            onClick={() => setConfirmingOutcome(o)}
                            className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto cursor-pointer"
                          >
                            Update Result
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {horizon === 'day' && (
            <div className="space-y-6">
              {/* Daily Summary & Objectives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">TOTAL PLANNED</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">{overviewData?.todaySummary.totalPlanned || 0}</span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">COMPLETED</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600">{overviewData?.todaySummary.totalCompleted || 0}</span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">PARTIAL / MISSED</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600">
                    {(overviewData?.todaySummary.totalPartial || 0) + (overviewData?.todaySummary.totalMissed || 0)}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-1">SCHEDULED TIME</span>
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-600">
                    {Math.floor((overviewData?.todaySummary.scheduledMinutes || 0) / 60)}h {(overviewData?.todaySummary.scheduledMinutes || 0) % 60}m
                  </span>
                </div>
              </div>

              {/* Schedule Timeline & Time Blocks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Daily Time Block Execution Schedule</h3>
                      <p className="text-xs text-slate-500">Structured time management for maximum focus</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingBlock(null);
                        setBlockTitle('');
                        setBlockTaskId('');
                        setBlockStartTime('09:00');
                        setBlockEndTime('10:00');
                        setIsTimeBlockModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      + Add Time Block
                    </button>
                  </div>

                  <div className="space-y-3">
                    {dailyData?.timeBlocks.length === 0 ? (
                      <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                        No time blocks scheduled for this date.
                      </div>
                    ) : (
                      dailyData?.timeBlocks.map((tb) => (
                        <div key={tb.id} className="p-4 bg-slate-50/80 hover:bg-blue-50/20 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs">
                          <div>
                            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                              <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                {new Date(tb.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                                {new Date(tb.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{tb.title}</span>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">{tb.status}</span>
                            </div>
                            {tb.notes && <p className="text-xs text-slate-500 mt-1">{tb.notes}</p>}
                          </div>
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            <button
                              onClick={() => {
                                setEditingBlock(tb);
                                setBlockTitle(tb.title);
                                setBlockTaskId(tb.taskId || '');
                                setBlockNotes(tb.notes || '');
                                setIsTimeBlockModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200/90 shadow-2xs cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTimeBlock(tb.id)}
                              className="px-3 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200 shadow-2xs cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Unscheduled / Ready Tasks */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Ready Tasks Available</h3>
                    <p className="text-xs text-slate-500">Backlog items ready for scheduling</p>
                  </div>
                  <div className="space-y-3">
                    {dailyData?.unscheduledReadyTasks.length === 0 ? (
                      <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
                        No unscheduled ready tasks.
                      </div>
                    ) : (
                      dailyData?.unscheduledReadyTasks.slice(0, 6).map((t) => (
                        <div key={t.id} className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/90 transition-colors shadow-2xs">
                          <span className="text-xs font-bold text-slate-900 block truncate">{t.title}</span>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 mt-1 inline-block">P{t.priority} • {t.estimateMinutes} min</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE OUTCOME MODAL */}
      {isOutcomeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">Add Planned Outcome ({horizon.toUpperCase()})</h3>
            <form onSubmit={handleCreateOutcomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={outcomeTitle}
                  onChange={(e) => setOutcomeTitle(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Implement Multi-Horizon Planning Engine"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Result</label>
                <textarea
                  rows={2}
                  value={outcomeExpectedResult}
                  onChange={(e) => setOutcomeExpectedResult(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Complete React components and backend services with 100% test coverage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={outcomePriority}
                    onChange={(e) => setOutcomePriority(e.target.value as any)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="P0">P0 (Critical)</option>
                    <option value="P1">P1 (High)</option>
                    <option value="P2">P2 (Medium)</option>
                    <option value="P3">P3 (Low)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Planned Minutes</label>
                  <input
                    type="number"
                    value={outcomePlannedMinutes}
                    onChange={(e) => setOutcomePlannedMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM OUTCOME MODAL */}
      {confirmingOutcome && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Record Actual Outcome Result</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{confirmingOutcome.title}</p>
            </div>
            <form onSubmit={handleConfirmOutcomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observed Outcome State</label>
                <select
                  value={confirmState}
                  onChange={(e) => setConfirmState(e.target.value as any)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="COMPLETED">🟢 Completed</option>
                  <option value="PARTIALLY_COMPLETED">🟡 Partially Completed</option>
                  <option value="MISSED">🔴 Missed</option>
                  <option value="BLOCKED">🟠 Blocked</option>
                  <option value="IN_PROGRESS">🔵 In Progress</option>
                  <option value="RESCHEDULED">↪ Rescheduled</option>
                  <option value="CANCELLED">⚫ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Actual Result Description</label>
                <textarea
                  rows={2}
                  value={confirmActualResult}
                  onChange={(e) => setConfirmActualResult(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. 18/18 tests passed, PR merged"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">User Explanation / Context</label>
                <textarea
                  rows={2}
                  value={confirmExplanation}
                  onChange={(e) => setConfirmExplanation(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Blocked by upstream database migration approval"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmingOutcome(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Confirming...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIME BLOCK MODAL */}
      {isTimeBlockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900">{editingBlock ? 'Edit Time Block' : 'Add Time Block'}</h3>
            <form onSubmit={handleSaveTimeBlock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Activity Title</label>
                <input
                  type="text"
                  required
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTimeBlockModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
