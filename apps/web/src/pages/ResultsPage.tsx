import React, { useState, useEffect } from 'react';
import {
  ResultAnalysisDto,
  SpreadsheetReportDto,
  PlanOutcomeDto,
  PlanOutcomeState,
  ResultSource,
} from '@kenenisa-os/shared';
import {
  fetchResultAnalysis,
  fetchDetailedResults,
  fetchSpreadsheetPreview,
  downloadXlsxReport,
} from '../features/results/api.js';

export const ResultsPage: React.FC = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('week');
  const [horizonFilter, setHorizonFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [analysis, setAnalysis] = useState<ResultAnalysisDto | null>(null);
  const [detailedOutcomes, setDetailedOutcomes] = useState<PlanOutcomeDto[]>([]);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetReportDto | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(1); // Default to Outcomes sheet
  const [selectedOutcome, setSelectedOutcome] = useState<PlanOutcomeDto | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<'current' | 'day' | 'week' | 'month' | 'year' | 'custom' | 'full'>('current');
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    loadResultsData();
  }, [period, horizonFilter, statusFilter]);

  const loadResultsData = async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string> = {};
      if (horizonFilter) queryParams.horizon = horizonFilter;
      if (statusFilter) queryParams.status = statusFilter;
      if (searchQuery) queryParams.search = searchQuery;

      const [analysisRes, detailedRes, spreadsheetRes] = await Promise.all([
        fetchResultAnalysis(queryParams),
        fetchDetailedResults(queryParams),
        fetchSpreadsheetPreview({ ...queryParams, scope: period }),
      ]);

      setAnalysis(analysisRes);
      setDetailedOutcomes(detailedRes.items || []);
      setSpreadsheet(spreadsheetRes);
    } catch (err) {
      console.error('Failed to load result intelligence data:', err);
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
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Completed</span>;
      case 'PARTIALLY_COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-yellow-100 text-yellow-800 border border-yellow-300">🟡 Partially Completed</span>;
      case 'MISSED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-300">🔴 Missed</span>;
      case 'BLOCKED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-orange-100 text-orange-800 border border-orange-300">🟠 Blocked</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-300">🔵 In Progress</span>;
      case 'RESCHEDULED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-purple-100 text-purple-800 border border-purple-300">↪ Rescheduled</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-200 text-slate-700 border border-slate-300">⚫ Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-300">⚪ Unknown</span>;
    }
  };

  const getSourceBadge = (source?: ResultSource) => {
    switch (source) {
      case 'SYSTEM_VERIFIED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-100 text-cyan-800 border border-cyan-200">Verified Evidence</span>;
      case 'USER_CONFIRMED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-100 text-indigo-800 border border-indigo-200">User Confirmed</span>;
      case 'AUTOMATIC':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Automatic Engine</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">Insufficient Telemetry</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 uppercase tracking-wide">
              Factual Telemetry
            </span>
            <span className="text-xs font-semibold text-slate-500">RES-001</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Automatic Result Intelligence & Excel Workspace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Objective outcome detection, evidence analysis, actionable advance recommendations, and in-app spreadsheet view.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#22C55E] hover:bg-emerald-600 rounded-xl shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Period Horizon Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['today', 'week', 'month', 'year', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'Custom Range'}
            </button>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search outcomes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadResultsData()}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 w-44"
          />

          <select
            value={horizonFilter}
            onChange={(e) => setHorizonFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
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
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
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

          {loading && <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />}
        </div>
      </div>

      {/* Counter Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-slate-500">Total Planned</span>
          <span className="text-xl font-black text-slate-900 mt-1">{analysis?.overview.totalPlanned || 0}</span>
        </div>
        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Completed 🟢</span>
          <span className="text-xl font-black text-emerald-900 mt-1">{analysis?.overview.completed || 0}</span>
        </div>
        <div className="bg-yellow-50/50 p-3 rounded-2xl border border-yellow-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-yellow-700">Partial 🟡</span>
          <span className="text-xl font-black text-yellow-900 mt-1">{analysis?.overview.partiallyCompleted || 0}</span>
        </div>
        <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-rose-700">Missed 🔴</span>
          <span className="text-xl font-black text-rose-900 mt-1">{analysis?.overview.missed || 0}</span>
        </div>
        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-orange-700">Blocked 🟠</span>
          <span className="text-xl font-black text-orange-900 mt-1">{analysis?.overview.blocked || 0}</span>
        </div>
        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-blue-700">In Progress 🔵</span>
          <span className="text-xl font-black text-blue-900 mt-1">{analysis?.overview.inProgress || 0}</span>
        </div>
        <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-200/80 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-purple-700">Rescheduled ↪</span>
          <span className="text-xl font-black text-purple-900 mt-1">{analysis?.overview.rescheduled || 0}</span>
        </div>
        <div className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase text-slate-600">Unknown ⚪</span>
          <span className="text-xl font-black text-slate-800 mt-1">{analysis?.overview.unknown || 0}</span>
        </div>
      </div>

      {/* Main Split Grid: Actionable Recommendations & Factual AI Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Actions & Recommendations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span>⚡</span> Actionable Advance Recommendations
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Integrated with Next Best Action Engine
            </span>
          </div>

          <div className="space-y-3">
            {analysis?.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-[#3AB1EC]/15 text-[#0284c7] font-black text-xs flex items-center justify-center shrink-0">
                  {rec.actionNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{rec.title}</h3>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-100 text-rose-800 uppercase">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{rec.reason}</p>
                </div>
              </div>
            ))}
            {(!analysis?.recommendations || analysis.recommendations.length === 0) && (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                Zero active blockers or unresolved items requiring advance actions.
              </div>
            )}
          </div>
        </div>

        {/* Factual Observations & AI Advisory */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs font-black text-cyan-400 uppercase tracking-wider">
              Intelligence Core Advisory
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Factual Telemetry Summary
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {analysis?.aiAdvisory || 'System analyzing authoritative telemetries...'}
              </p>
            </div>

            {analysis?.patterns && analysis.patterns.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Detected System Patterns
                </span>
                {analysis.patterns.map((pat) => (
                  <div key={pat.id} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50 text-[11px]">
                    <span className="font-semibold text-yellow-400 block">{pat.summary}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{pat.evidence}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Excel Workspace — In-App Spreadsheet View */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Spreadsheet Tab Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-emerald-400">📊 Excel Workspace (In-App Preview)</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {spreadsheet?.sheets[activeSheetIndex]?.totalRows || 0} rows
            </span>
          </div>

          {/* Sheet Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {spreadsheet?.sheets.map((sheet, index) => (
              <button
                key={sheet.name}
                onClick={() => setActiveSheetIndex(index)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                  activeSheetIndex === index
                    ? 'bg-[#22C55E] text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        </div>

        {/* Spreadsheet Grid View */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                {spreadsheet?.sheets[activeSheetIndex]?.columns.map((col) => (
                  <th key={col.key} className="p-3 border-r border-slate-200 whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                <th className="p-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {spreadsheet?.sheets[activeSheetIndex]?.rows.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  {spreadsheet.sheets[activeSheetIndex].columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key} className="p-3 border-r border-slate-100 whitespace-nowrap max-w-xs truncate">
                        {col.key === 'outcomeState' ? (
                          getStatusBadge(value as PlanOutcomeState)
                        ) : col.key === 'source' ? (
                          getSourceBadge(value as ResultSource)
                        ) : (
                          String(value ?? '—')
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        const outcome = detailedOutcomes.find((o) => o.id === row.id);
                        if (outcome) setSelectedOutcome(outcome);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {(!spreadsheet?.sheets[activeSheetIndex]?.rows || spreadsheet.sheets[activeSheetIndex].rows.length === 0) && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    No spreadsheet records found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Detail Modal */}
      {selectedOutcome && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">
                  Outcome Audit Details
                </span>
                <h3 className="text-base font-black text-slate-900">{selectedOutcome.title}</h3>
              </div>
              <button
                onClick={() => setSelectedOutcome(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Expected Result</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedOutcome.expectedResult || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Actual Result</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedOutcome.actualResult || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Outcome Status</span>
                <div className="mt-1">{getStatusBadge(selectedOutcome.outcomeState)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Result Source</span>
                <div className="mt-1">{getSourceBadge(selectedOutcome.source)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Related Task</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedOutcome.task?.title || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Related Project</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedOutcome.project?.name || '—'}</p>
              </div>
            </div>

            {selectedOutcome.evidenceLinks && selectedOutcome.evidenceLinks.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Verifiable Evidence Proof ({selectedOutcome.evidenceLinks.length})
                </span>
                {selectedOutcome.evidenceLinks.map((link) => (
                  <div key={link.id} className="p-2 rounded bg-slate-50 border text-xs flex justify-between">
                    <span>{link.evidence?.title || link.evidenceId}</span>
                    <span className="font-semibold text-emerald-700">{link.verificationState}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOutcome(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900">Export Excel Workbook (.xlsx)</h3>
            <p className="text-xs text-slate-600">
              Select export period scope. The generated workbook contains Summary, Outcomes, and Actionable Recommendations sheets.
            </p>

            <div className="space-y-2 text-xs font-semibold">
              {[
                { id: 'current', label: 'Current Filtered View' },
                { id: 'day', label: 'Selected Day' },
                { id: 'week', label: 'Selected Week' },
                { id: 'month', label: 'Selected Month' },
                { id: 'year', label: 'Selected Year' },
                { id: 'full', label: 'Full Result History' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-slate-50 cursor-pointer">
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
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleExportClick}
                disabled={exporting}
                className="px-4 py-2 text-xs font-bold text-white bg-[#22C55E] hover:bg-emerald-600 rounded-xl disabled:opacity-50"
              >
                {exporting ? 'Generating XLSX...' : 'Download File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
