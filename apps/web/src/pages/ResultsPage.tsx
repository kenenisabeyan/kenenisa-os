import React, { useState, useEffect } from 'react';
import {
  ResultAnalysisDto,
  SpreadsheetReportDto,
  PlanOutcomeDto,
  PlanOutcomeState,
  ResultSource,
  ResultTimelineEntryDto,
  PeriodComparisonDto,
  WorkstreamResultBreakdownDto,
  ProjectResultBreakdownDto,
  CapacityTimeAnalysisDto,
} from '@kenenisa-os/shared';
import {
  fetchResultAnalysis,
  fetchDetailedResults,
  fetchSpreadsheetPreview,
  downloadXlsxReport,
  fetchResultTimeline,
  fetchPeriodComparison,
  fetchWorkstreamBreakdown,
  fetchProjectBreakdown,
  fetchCapacityAnalysis,
} from '../features/results/api.js';

export const ResultsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analysis' | 'recommendations' | 'reports'>('overview');

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [horizonFilter, setHorizonFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [analysis, setAnalysis] = useState<ResultAnalysisDto | null>(null);
  const [detailedOutcomes, setDetailedOutcomes] = useState<PlanOutcomeDto[]>([]);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetReportDto | null>(null);
  const [timelineEntries, setTimelineEntries] = useState<ResultTimelineEntryDto[]>([]);
  const [periodComparison, setPeriodComparison] = useState<PeriodComparisonDto | null>(null);
  const [workstreams, setWorkstreams] = useState<WorkstreamResultBreakdownDto[]>([]);
  const [projects, setProjects] = useState<ProjectResultBreakdownDto[]>([]);
  const [capacityAnalysis, setCapacityAnalysis] = useState<CapacityTimeAnalysisDto | null>(null);

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(1);
  const [selectedOutcome, setSelectedOutcome] = useState<PlanOutcomeDto | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<'current' | 'day' | 'week' | 'month' | 'year' | 'custom' | 'full'>('current');
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    loadWorkspaceData();
  }, [period, horizonFilter, statusFilter]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {};
      if (horizonFilter) queryParams.horizon = horizonFilter;
      if (statusFilter) queryParams.status = statusFilter;
      if (searchQuery) queryParams.search = searchQuery;

      const [
        analysisRes,
        detailedRes,
        spreadsheetRes,
        timelineRes,
        comparisonRes,
        workstreamsRes,
        projectsRes,
        capacityRes,
      ] = await Promise.all([
        fetchResultAnalysis(queryParams),
        fetchDetailedResults(queryParams),
        fetchSpreadsheetPreview({ ...queryParams, scope: period }),
        fetchResultTimeline(queryParams),
        fetchPeriodComparison(period === 'month' ? 'month' : 'week'),
        fetchWorkstreamBreakdown(),
        fetchProjectBreakdown(),
        fetchCapacityAnalysis(),
      ]);

      setAnalysis(analysisRes);
      setDetailedOutcomes(detailedRes.items || []);
      setSpreadsheet(spreadsheetRes);
      setTimelineEntries(timelineRes || []);
      setPeriodComparison(comparisonRes);
      setWorkstreams(workstreamsRes || []);
      setProjects(projectsRes || []);
      setCapacityAnalysis(capacityRes);
    } catch (err) {
      console.error('Failed to load results workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = async () => {
    setExporting(true);
    try {
      const queryParams: Record<string, string> = { scope: exportScope };
      if (horizonFilter) queryParams.horizon = horizonFilter;
      if (statusFilter) queryParams.status = statusFilter;
      if (searchQuery) queryParams.search = searchQuery;

      await downloadXlsxReport(queryParams);
      setExportModalOpen(false);
    } catch (err) {
      console.error('Failed to download XLSX report:', err);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (state: PlanOutcomeState) => {
    switch (state) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-[#22C55E] border border-emerald-300">🟢 Completed</span>;
      case 'PARTIALLY_COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-yellow-100 text-[#FFD700] border border-yellow-300">🟡 Partially Completed</span>;
      case 'MISSED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-100 text-[#FF5A00] border border-rose-300">🔴 Missed</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-orange-100 text-[#FF5A00] border border-orange-300">🟠 Blocked</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-[#3B82F6] border border-blue-300">🔵 In Progress</span>;
      case 'RESCHEDULED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-100 text-[#6366F1] border border-purple-300">↪ Rescheduled</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-200 text-slate-700 border border-slate-300">⚫ Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-300">⚪ Unknown</span>;
    }
  };

  const getSourceBadge = (source?: ResultSource) => {
    switch (source) {
      case 'SYSTEM_VERIFIED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-100 text-cyan-800 border border-cyan-200">System Verified</span>;
      case 'USER_CONFIRMED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-100 text-indigo-800 border border-indigo-200">User Confirmed</span>;
      case 'AUTOMATIC':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Automatic</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">Unknown Telemetry</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 uppercase tracking-wide">
              Results & Insights Workspace
            </span>
            <span className="text-xs font-semibold text-slate-500">RES-001</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Results & Insights
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand what you planned, what actually happened, why, and what needs attention next.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setExportModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#22C55E] hover:bg-emerald-600 rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-nowrap w-full sm:w-auto pb-1">
          {(['overview', 'timeline', 'analysis', 'recommendations', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 text-xs font-extrabold capitalize whitespace-nowrap transition-all border-b-2 -mb-[9px] ${
                activeTab === tab
                  ? 'border-[#3AB1EC] text-[#0284c7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'reports' ? 'Reports (Spreadsheet)' : tab}
            </button>
          ))}
        </div>

        {/* Period Horizon Selector */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-nowrap w-full sm:w-auto p-1 bg-slate-100 rounded-xl">
          {(['today', 'week', 'month', 'year', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg capitalize whitespace-nowrap transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadWorkspaceData()}
            className="w-full sm:w-52 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400"
          />

          <select
            value={horizonFilter}
            onChange={(e) => setHorizonFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="">All Horizons</option>
            <option value="YEARLY">Yearly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="WEEKLY">Weekly</option>
            <option value="DAILY">Daily</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">🟢 Completed</option>
            <option value="PARTIALLY_COMPLETED">🟡 Partially Completed</option>
            <option value="MISSED">🔴 Missed</option>
            <option value="BLOCKED">🟠 Blocked</option>
            <option value="IN_PROGRESS">🔵 In Progress</option>
            <option value="RESCHEDULED">↪ Rescheduled</option>
            <option value="CANCELLED">⚫ Cancelled</option>
            <option value="UNKNOWN">⚪ Unknown</option>
          </select>
        </div>

        {loading && <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0 self-center" />}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-slate-500">Planned</span>
          <span className="text-xl font-black text-slate-900 mt-1">{analysis?.overview.totalPlanned || 0}</span>
        </div>
        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#22C55E]">Completed 🟢</span>
          <span className="text-xl font-black text-emerald-900 mt-1">{analysis?.overview.completed || 0}</span>
        </div>
        <div className="bg-yellow-50/50 p-3 rounded-2xl border border-yellow-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#FFD700]">Partial 🟡</span>
          <span className="text-xl font-black text-yellow-900 mt-1">{analysis?.overview.partiallyCompleted || 0}</span>
        </div>
        <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#FF5A00]">Missed 🔴</span>
          <span className="text-xl font-black text-rose-900 mt-1">{analysis?.overview.missed || 0}</span>
        </div>
        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#FF5A00]">Blocked 🟠</span>
          <span className="text-xl font-black text-orange-900 mt-1">{analysis?.overview.blocked || 0}</span>
        </div>
        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#3B82F6]">In Progress 🔵</span>
          <span className="text-xl font-black text-blue-900 mt-1">{analysis?.overview.inProgress || 0}</span>
        </div>
        <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-[#6366F1]">Rescheduled ↪</span>
          <span className="text-xl font-black text-purple-900 mt-1">{analysis?.overview.rescheduled || 0}</span>
        </div>
        <div className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-slate-600">Unknown ⚪</span>
          <span className="text-xl font-black text-slate-800 mt-1">{analysis?.overview.unknown || 0}</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW SUB-VIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Outcome Records Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              What Happened (Factual Outcome Records)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailedOutcomes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedOutcome(item)}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">
                        {item.horizon} · {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Active Schedule'}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-0.5">{item.title}</h3>
                    </div>
                    {getStatusBadge(item.outcomeState)}
                  </div>

                  {/* Expected vs Actual */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Expected</span>
                      <span className="text-slate-700 font-medium truncate block">{item.expectedResult || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Actual</span>
                      <span className="text-slate-700 font-medium truncate block">{item.actualResult || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200/60 pt-2">
                    <span className="font-semibold">{item.project?.name || 'General Execution'}</span>
                    <div className="flex items-center gap-2">
                      {getSourceBadge(item.source)}
                      <span className="font-bold text-slate-700">{item.evidenceLinks?.length || 0} proof</span>
                    </div>
                  </div>
                </div>
              ))}
              {detailedOutcomes.length === 0 && (
                <div className="col-span-2 text-xs text-slate-500 italic p-8 text-center">
                  Zero outcome records found for current filters.
                </div>
              )}
            </div>
          </div>

          {/* AI Advisory Panel */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 rounded-2xl border border-indigo-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xs font-black text-blue-700 uppercase tracking-wider">
                Intelligence Core Advisory
              </h2>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed font-medium">
              {analysis?.aiAdvisory || 'System evaluating outcome telemetries...'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: TIMELINE SUB-VIEW */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            Chronological Timeline View
          </h2>

          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6 pt-2">
            {timelineEntries.map((entry) => (
              <div key={entry.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-500" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{entry.timeLabel}</span>
                    <h3 className="text-xs font-bold text-slate-900">{entry.title}</h3>
                  </div>
                  {getStatusBadge(entry.outcomeState)}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Expected: {entry.expectedResult} · Actual: {entry.actualResult || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYSIS SUB-VIEW */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* Period Comparison & Capacity Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Period Comparison */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-900">
                Period Comparison ({periodComparison?.currentPeriodLabel} vs {periodComparison?.previousPeriodLabel})
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Completed Outcomes</span>
                  <span className="font-bold text-emerald-700">
                    {periodComparison?.metrics.completed.previous} → {periodComparison?.metrics.completed.current} ({periodComparison?.metrics.completed.change})
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Missed Outcomes</span>
                  <span className="font-bold text-rose-700">
                    {periodComparison?.metrics.missed.previous} → {periodComparison?.metrics.missed.current} ({periodComparison?.metrics.missed.change})
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Blocked Outcomes</span>
                  <span className="font-bold text-orange-700">
                    {periodComparison?.metrics.blocked.previous} → {periodComparison?.metrics.blocked.current} ({periodComparison?.metrics.blocked.change})
                  </span>
                </div>
              </div>
            </div>

            {/* Time & Capacity Analysis */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-900">Time & Capacity Analysis</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Configured Capacity</span>
                  <span className="font-bold text-slate-800">{Math.round((capacityAnalysis?.availableCapacityMinutes || 480) / 60)}h</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Scheduled Time Blocks</span>
                  <span className="font-bold text-blue-700">{Math.round((capacityAnalysis?.totalScheduledMinutes || 0) / 60)}h</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-50">
                  <span>Recorded Actual Time</span>
                  <span className="font-bold text-emerald-700">{Math.round((capacityAnalysis?.totalActualMinutes || 0) / 60)}h</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">{capacityAnalysis?.capacityConflictNotes}</p>
            </div>
          </div>

          {/* Workstream & Project Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-900">Workstream Execution Breakdown</h3>
              <div className="grid grid-cols-1 gap-2">
                {workstreams.map((w) => (
                  <div key={w.workstreamId} className="p-3 rounded-xl bg-slate-50 border text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{w.workstreamName}</span>
                      <span className="text-emerald-700 font-extrabold">{w.completionRatePercent}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Planned: {w.totalPlanned} · Completed: {w.completed} · Blocked: {w.blocked}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-900">Project Execution Breakdown</h3>
              <div className="grid grid-cols-1 gap-2">
                {projects.map((p) => (
                  <div key={p.projectId} className="p-3 rounded-xl bg-slate-50 border text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{p.projectName}</span>
                      <span className="text-emerald-700 font-extrabold">{p.completionRatePercent}%</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Planned: {p.totalPlanned} · Completed: {p.completed} · Blocked: {p.blocked}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RECOMMENDATIONS SUB-VIEW */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            Actionable Next Actions (Next Best Action Engine)
          </h2>

          <div className="space-y-3">
            {analysis?.recommendations.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-50 border flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#3AB1EC]/15 text-[#0284c7] font-black text-xs flex items-center justify-center shrink-0">
                  {rec.actionNumber}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-800 uppercase">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS (EXCEL WORKSPACE) */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3 bg-slate-50/90 text-slate-900 border-b border-slate-200">
            <span className="text-xs font-black uppercase text-emerald-700">📊 In-App Spreadsheet Workspace</span>
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-nowrap bg-slate-200/80 p-1 rounded-xl w-full sm:w-auto">
              {spreadsheet?.sheets.map((sheet, index) => (
                <button
                  key={sheet.name}
                  onClick={() => setActiveSheetIndex(index)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                    activeSheetIndex === index ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b font-bold text-slate-700">
                  {spreadsheet?.sheets[activeSheetIndex]?.columns.map((col) => (
                    <th key={col.key} className="p-3 border-r whitespace-nowrap">{col.header}</th>
                  ))}
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {spreadsheet?.sheets[activeSheetIndex]?.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/50">
                    {spreadsheet.sheets[activeSheetIndex].columns.map((col) => (
                      <td key={col.key} className="p-3 border-r whitespace-nowrap max-w-xs truncate">
                        {col.key === 'outcomeState' ? (
                          getStatusBadge(row[col.key] as PlanOutcomeState)
                        ) : col.key === 'source' ? (
                          getSourceBadge(row[col.key] as ResultSource)
                        ) : (
                          String(row[col.key] ?? '—')
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          const outcome = detailedOutcomes.find((o) => o.id === row.id);
                          if (outcome) setSelectedOutcome(outcome);
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result Detail Drawer */}
      {selectedOutcome && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white max-w-md w-full h-full p-6 space-y-5 shadow-2xl overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Result Drawer</span>
                <h3 className="text-sm font-black text-slate-900">{selectedOutcome.title}</h3>
              </div>
              <button onClick={() => setSelectedOutcome(null)} className="text-slate-400 font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected vs Actual</span>
                <p className="mt-1"><strong>Expected:</strong> {selectedOutcome.expectedResult || '—'}</p>
                <p className="mt-0.5"><strong>Actual:</strong> {selectedOutcome.actualResult || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status & Source</span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedOutcome.outcomeState)}
                  {getSourceBadge(selectedOutcome.source)}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Execution Details</span>
                <p className="mt-1">Task: {selectedOutcome.task?.title || '—'}</p>
                <p className="mt-0.5">Project: {selectedOutcome.project?.name || '—'}</p>
              </div>
            </div>

            <div className="flex justify-end border-t pt-3">
              <button onClick={() => setSelectedOutcome(null)} className="px-4 py-2 text-xs font-bold bg-slate-100 rounded-xl">
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-black text-slate-900">Export Excel Workbook (.xlsx)</h3>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { id: 'current', label: 'Current View' },
                { id: 'day', label: 'Selected Day' },
                { id: 'week', label: 'Selected Week' },
                { id: 'month', label: 'Selected Month' },
                { id: 'year', label: 'Selected Year' },
                { id: 'full', label: 'Full History' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-slate-50">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === opt.id}
                    onChange={() => setExportScope(opt.id as any)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setExportModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button onClick={handleExportClick} disabled={exporting} className="px-4 py-2 text-xs font-bold text-white bg-[#22C55E] rounded-xl">
                {exporting ? 'Generating...' : 'Download File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
