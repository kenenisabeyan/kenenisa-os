import React, { useEffect, useState, useCallback } from 'react';
import { fetchDashboard } from '../features/dashboard/api.js';
import { startTask, completeTask, blockTask, createTask, reopenTask } from '../features/tasks/api.js';
import { DashboardDto, TaskDto, WorkstreamDto, WorkstreamStatus, TaskPriority } from '@kenenisa-os/shared';
import { createWorkstream, updateWorkstream } from '../features/workstreams/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard, EmptyStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';
import { webPerformanceProfiler } from '../lib/performance-profiler.js';
import { ZapIcon } from '../components/common/ZapIcon.js';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardDto | null>(() =>
    getCachedApiData<DashboardDto>('/api/v1/dashboard'),
  );
  const [loading, setLoading] = useState<boolean>(() => !data);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedWorkstreamId, setSelectedWorkstreamId] = useState<string>('ALL');

  // Task Category / Workstream Modals
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryPriority, setNewCategoryPriority] = useState<number>(5);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  const [editingCategory, setEditingCategory] = useState<WorkstreamDto | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');
  const [editCategoryPriority, setEditCategoryPriority] = useState<number>(5);
  const [editCategoryStatus, setEditCategoryStatus] = useState<WorkstreamStatus>('ACTIVE');
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Notion-Style Scratchpad & Quick Capture State
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    return localStorage.getItem('kenenisa_os_scratchpad') || '';
  });
  const [scratchpadSaved, setScratchpadSaved] = useState(false);

  const handleScratchpadChange = (val: string) => {
    setScratchpadText(val);
    localStorage.setItem('kenenisa_os_scratchpad', val);
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2000);
  };

  const handleApplyTemplate = (prefix: string) => {
    const updated = scratchpadText ? `${scratchpadText}\n\n${prefix} ` : `${prefix} `;
    handleScratchpadChange(updated);
  };

  // Convert Scratchpad to Official Executable Task
  const [isConvertToTaskOpen, setIsConvertToTaskOpen] = useState(false);
  const [convertTitle, setConvertTitle] = useState('');
  const [convertProjectId, setConvertProjectId] = useState('');
  const [convertDescription, setConvertDescription] = useState('');
  const [convertPriority, setConvertPriority] = useState<TaskPriority>('P2');
  const [convertEstimateMinutes, setConvertEstimateMinutes] = useState('45');
  const [isConverting, setIsConverting] = useState(false);

  const handleOpenConvertToTask = () => {
    if (!scratchpadText.trim()) {
      showToast('Scratchpad is empty! Type a thought or note first.', 'warning');
      return;
    }
    const lines = scratchpadText.trim().split('\n');
    const firstLine = lines[0].replace(/^[-*•\[\s\]💡🐛📚⚡]+/, '').trim() || 'New Quick Task';
    const remaining = lines.slice(1).join('\n').trim();

    setConvertTitle(firstLine);
    setConvertDescription(remaining || scratchpadText.trim());
    if (data?.activeProjects && data.activeProjects.length > 0) {
      setConvertProjectId(data.activeProjects[0].id);
    }
    setConvertPriority('P2');
    setConvertEstimateMinutes('45');
    setIsConvertToTaskOpen(true);
  };

  const handleConvertToTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertTitle.trim() || !convertProjectId) {
      showToast('Please enter a task title and choose a project', 'error');
      return;
    }
    setIsConverting(true);
    try {
      await createTask({
        title: convertTitle.trim(),
        projectId: convertProjectId,
        description: convertDescription.trim() || undefined,
        priority: convertPriority,
        estimateMinutes: parseInt(convertEstimateMinutes, 10) || 0,
      });
      showToast(`Task "${convertTitle.trim()}" created from scratchpad!`, 'success');
      setIsConvertToTaskOpen(false);
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create task from scratchpad', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  const handleOpenCreateCategory = () => {
    setNewCategoryName('');
    setNewCategoryDesc('');
    setNewCategoryPriority(5);
    setIsCreateCategoryOpen(true);
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingCategory(true);
    try {
      await createWorkstream({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
        priorityWeight: Number(newCategoryPriority) || 5,
      });
      showToast(`Category "${newCategoryName.trim()}" created successfully`, 'success');
      setIsCreateCategoryOpen(false);
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create category', 'error');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleOpenEditCategory = (ws: WorkstreamDto) => {
    setEditingCategory(ws);
    setEditCategoryName(ws.name);
    setEditCategoryDesc(ws.description || '');
    setEditCategoryPriority(ws.priorityWeight);
    setEditCategoryStatus(ws.status);
  };

  const handleUpdateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    setIsUpdatingCategory(true);
    try {
      await updateWorkstream(editingCategory.id, {
        name: editCategoryName.trim(),
        description: editCategoryDesc.trim() || null,
        priorityWeight: Number(editCategoryPriority) || 5,
        status: editCategoryStatus,
      });
      showToast(`Category updated to "${editCategoryName.trim()}" successfully`, 'success');
      setEditingCategory(null);
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update category', 'error');
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const loadDashboard = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent && !data) {
          setLoading(true);
        }
        setError(null);
        const res = await fetchDashboard();
        setData(res);
        webPerformanceProfiler.markMeaningfulContent('/app/dashboard');
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Failed to load Command Center data';
        if (data) {
          showToast(`Could not refresh Command Center: ${errMsg}`, 'warning');
        } else {
          setError(errMsg);
        }
      } finally {
        setLoading(false);
      }
    },
    [data, showToast],
  );

  useEffect(() => {
    void loadDashboard();
  }, []); // Run initial load on mount

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

  const handleReopenTask = async (taskId: string) => {
    try {
      setActionLoading(taskId);
      await reopenTask(taskId);
      showToast('Task reopened to ready queue', 'info');
      await loadDashboard();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reopen task', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportStandup = () => {
    if (!data) return;
    const todayDate = new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const todayTasks = [...data.today.inProgress, ...data.today.dueToday];
    const lines = [
      `# 🚀 KENENISA OS Daily Standup Briefing`,
      `**Date**: ${todayDate}`,
      '',
      `## 🎯 Next Best Action`,
      data.nextBestAction?.recommendedTask
        ? `- **${data.nextBestAction.recommendedTask.title}** (Priority: ${data.nextBestAction.recommendedTask.priority}, Score: ${data.nextBestAction.score}/100)`
        : '- Queue cleared or no pending tasks.',
      '',
      `## Today's Execution Focus (${todayTasks.length} tasks)`,
      ...(todayTasks.length > 0
        ? todayTasks.map(
            (t) => `- [${t.status === 'DONE' ? 'x' : ' '}] **${t.title}** [${t.priority}] (${t.status})`
          )
        : ['- No active tasks scheduled for today.']),
      '',
      `## 🧱 Blocked Items (${data.blockedTasks.length} tasks)`,
      ...(data.blockedTasks.length > 0
        ? data.blockedTasks.map((t) => `- ⚠️ **${t.title}** [${t.priority}]`)
        : ['- No blocked tasks. System running smoothly!']),
      '',
      `## ⏳ Overdue Tasks (${data.overdueTasks.length} tasks)`,
      ...(data.overdueTasks.length > 0
        ? data.overdueTasks.map((t) => `- ⚠️ **${t.title}** (Due: ${t.dueDate ? t.dueDate.split('T')[0] : 'N/A'})`)
        : ['- None.']),
      '',
      `## 📁 Active Projects (${data.activeProjects.length} projects)`,
      ...data.activeProjects.map((p) => `- **${p.name}** [${p.priority}] (${p.workstream?.name || 'General'})`),
      '',
      `---`,
      `*Generated from KENENISA OS Command Center*`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Daily Standup briefing copied to clipboard!', 'success');
  };

  if (error && !data) {
    return (
      <div className="my-8" id="dashboard-error">
        <ErrorStateCard title="Error Loading Command Center" message={error} onRetry={() => void loadDashboard()} />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-6" id="dashboard-loading">
        <PageHeader title="Command Center" description="Deterministic execution recommendations and personal operating status." />
        <LoadingSkeleton rows={4} height="h-32" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="my-8" id="dashboard-empty">
        <EmptyStateCard
          title="Command Center Ready"
          description="No operating data found yet. Start by defining your core workstreams or initializing tasks."
          actionLabel="Refresh Dashboard"
          onAction={() => void loadDashboard()}
        />
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <button
              id="export-standup-btn"
              onClick={handleExportStandup}
              className="px-3.5 py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Copy Daily Standup briefing to clipboard as Markdown"
            >
              <span>📋</span>
              <span className="hidden sm:inline">Standup Briefing</span>
            </button>
            <button
              id="refresh-dashboard-btn"
              onClick={() => { void loadDashboard(); }}
              disabled={loading}
              className="px-4 py-2.5 rounded-sm bg-white hover:bg-slate-50 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
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
          </div>
        }
      />

      <PageAiCopilot pageType="dashboard" />

      {/* 7 Core Operating Questions Front-Door Overview */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4" id="front-door-questions-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 truncate">
              COMMAND CENTER &bull; OPERATING CONTEXT ANSWERS
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold tracking-wider shrink-0">
            REAL-TIME DOMAIN INTELLIGENCE
          </span>
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
              <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xs self-start sm:self-auto">
                <span className="text-xs text-white/80 font-medium">Execution Priority Index</span>
                <span className="text-base font-black text-cyan-200" id="nba-score">
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
                <span className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-white/15 text-white border border-white/20">
                  Status: {nextBestAction.recommendedTask.status}
                </span>
                {nextBestAction.recommendedTask.project && (
                  <span className="text-xs text-cyan-100 bg-cyan-400/20 px-2.5 sm:px-3 py-1 rounded-lg border border-cyan-300/30 font-semibold flex items-center gap-1.5">
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
                <p className="text-white/90 text-xs sm:text-sm mb-6 max-w-3xl leading-relaxed">
                  {nextBestAction.recommendedTask.description}
                </p>
              )}

              {/* Algorithm Scoring Breakdown Grid */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 mb-6">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Algorithm Scoring Criteria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {nextBestAction.reasons.map((r, idx) => (
                    <div key={idx} className="bg-white/15 rounded-xl p-3 border border-white/15 backdrop-blur-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white font-bold">{r.category}</span>
                        <span className="text-cyan-200 font-black">+{r.points}</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-snug line-clamp-2">{r.description}</p>
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
                    className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-sm bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
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
                    className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
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
                  className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-3 rounded-sm bg-white/15 hover:bg-rose-500/30 text-white border border-white/20 hover:border-rose-300/40 text-xs font-bold transition-all disabled:opacity-50 text-center cursor-pointer backdrop-blur-md"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3.5" id="summary-metrics">
        {/* Workstreams */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-blue-500 via-cyan-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/15 blur-lg pointer-events-none group-hover:bg-blue-500/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_8px_rgba(34,211,238,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Workstreams</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeWorkstreams}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Core</div>
          </div>
        </div>

        {/* Goals */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-indigo-500 via-purple-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-indigo-500/15 blur-lg pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full shadow-[0_0_8px_rgba(192,132,252,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Goals</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeGoals}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">In Progress</div>
          </div>
        </div>

        {/* Projects */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-cyan-500 via-teal-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-500/15 blur-lg pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full shadow-[0_0_8px_rgba(45,212,191,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Projects</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">{summary.activeProjects}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Build</div>
          </div>
        </div>

        {/* Ready Tasks */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-sky-500 via-blue-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-sky-500/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-sky-500/15 blur-lg pointer-events-none group-hover:bg-sky-500/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full shadow-[0_0_8px_rgba(96,165,250,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Ready</span>
                <span className="w-2 h-2 rounded-full bg-sky-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-sky-600 mt-2 tracking-tight">{summary.readyTasks}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Candidate Queue</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-blue-600 via-indigo-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-600/15 blur-lg pointer-events-none group-hover:bg-blue-600/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_8px_rgba(129,140,248,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">In Progress</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-blue-600 mt-2 tracking-tight">{summary.inProgressTasks}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Active Focus</div>
          </div>
        </div>

        {/* Blocked */}
        <div className={`relative p-[2px] rounded-2xl bg-gradient-to-b ${summary.blockedTasks > 0 ? 'from-rose-500 via-rose-300/40' : 'from-slate-400 via-slate-300/40'} to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300 group`}>
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 ${summary.blockedTasks > 0 ? 'bg-rose-500/15' : 'bg-slate-400/10'} blur-lg pointer-events-none group-hover:bg-rose-500/25 transition-all duration-300`} />
          <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent ${summary.blockedTasks > 0 ? 'via-rose-500' : 'via-slate-400'} to-transparent rounded-full shadow-[0_0_8px_rgba(244,63,94,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300`} />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Blocked</span>
                <span className={`w-2 h-2 rounded-full ${summary.blockedTasks > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
              </div>
              <div className={`text-2xl font-black mt-2 tracking-tight ${summary.blockedTasks > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {summary.blockedTasks}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Needs Action</div>
          </div>
        </div>

        {/* Overdue */}
        <div className={`relative p-[2px] rounded-2xl bg-gradient-to-b ${summary.overdueTasks > 0 ? 'from-amber-500 via-orange-300/40' : 'from-slate-400 via-slate-300/40'} to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 group`}>
          <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 ${summary.overdueTasks > 0 ? 'bg-amber-500/15' : 'bg-slate-400/10'} blur-lg pointer-events-none group-hover:bg-amber-500/25 transition-all duration-300`} />
          <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent ${summary.overdueTasks > 0 ? 'via-amber-500' : 'via-slate-400'} to-transparent rounded-full shadow-[0_0_8px_rgba(245,158,11,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300`} />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Overdue</span>
                <span className={`w-2 h-2 rounded-full ${summary.overdueTasks > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
              </div>
              <div className={`text-2xl font-black mt-2 tracking-tight ${summary.overdueTasks > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {summary.overdueTasks}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Past Target</div>
          </div>
        </div>

        {/* 7d Completed */}
        <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-emerald-500 via-teal-400/40 to-slate-200/60 shadow-2xs hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-emerald-500/15 blur-lg pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-300" />
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent rounded-full shadow-[0_0_8px_rgba(45,212,191,0.7)] pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
          <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">7d Done</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-2 tracking-tight">{summary.completedTasksRecent}</div>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold mt-1">Verified Impact</div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols wide): Today Focus & Critical Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Focus */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="today-focus-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Today&apos;s Execution Focus</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Tasks scheduled for today or active right now</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold border border-blue-200/80">
                  {today.dueToday.length + today.inProgress.length} items
                </span>
              </div>
            </div>

            {/* Task Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedWorkstreamId('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedWorkstreamId === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Categories ({today.inProgress.length + today.dueToday.length})
              </button>
              {workstreams.map((ws) => {
                const count = [...today.inProgress, ...today.dueToday].filter((t) => {
                  const proj = activeProjects.find((p) => p.id === t.projectId);
                  return proj?.workstreamId === ws.id;
                }).length;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setSelectedWorkstreamId(ws.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      selectedWorkstreamId === ws.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{ws.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedWorkstreamId === ws.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all whitespace-nowrap cursor-pointer"
                title="Add new task category"
              >
                + New Category
              </button>
            </div>

            {(() => {
              const allTodayTasks = [...today.inProgress, ...today.dueToday];
              const filteredTasks = allTodayTasks.filter((task) => {
                if (selectedWorkstreamId === 'ALL') return true;
                const proj = activeProjects.find((p) => p.id === task.projectId);
                return proj?.workstreamId === selectedWorkstreamId;
              });

              if (filteredTasks.length === 0) {
                return (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium space-y-2">
                    <p>No tasks scheduled for today in this category.</p>
                    {selectedWorkstreamId !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstreamId('ALL')}
                        className="text-xs text-blue-600 font-bold hover:underline"
                      >
                        Reset category filter
                      </button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const ws = activeProjects.find((p) => p.id === task.projectId)?.workstream;
                    return (
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
                            {ws && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                🗂️ {ws.name}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                          {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                            <button
                              onClick={() => { void handleStartTask(task.id); }}
                              disabled={actionLoading === task.id}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              ▶ Start
                            </button>
                          )}
                          {task.status !== 'DONE' && (
                            <button
                              onClick={() => { void handleCompleteTask(task.id); }}
                              disabled={actionLoading === task.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              ✓ Done
                            </button>
                          )}
                          {task.status !== 'BLOCKED' && task.status !== 'DONE' && (
                            <button
                              onClick={() => { void handleBlockTask(task.id); }}
                              disabled={actionLoading === task.id}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Flag Blocked"
                            >
                              ⛔ Block
                            </button>
                          )}
                          {task.status === 'DONE' && (
                            <button
                              onClick={() => { void handleReopenTask(task.id); }}
                              disabled={actionLoading === task.id}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              ↻ Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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

        {/* Right Column (1 col wide): Quick Capture, Workstreams, Active Projects & Audit Activity */}
        <div className="space-y-8">
          {/* Notion-Style Quick Capture Scratchpad & Idea Vault */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="scratchpad-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
                  <ZapIcon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Quick Capture &amp; Scratchpad</h3>
                  <p className="text-slate-500 text-[11px] font-medium">Auto-saving idea vault with 1-click task conversion</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {scratchpadSaved && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-pulse">
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* Quick Template Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleApplyTemplate('Task:')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <span>+</span>
                <ZapIcon className="w-2.5 h-2.5 text-blue-600" />
                <span>Task</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('💡 Idea:')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                + 💡 Idea
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('🐛 Bug:')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                + 🐛 Bug
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('📚 Study:')}
                className="px-2.5 py-1 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                + 📚 Study
              </button>
            </div>

            {/* Scratchpad Textarea */}
            <div className="relative">
              <textarea
                rows={4}
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Capture fleeting thoughts, ideas, bugs, or study topics. Auto-saved locally..."
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono leading-relaxed transition-all resize-y"
              />
            </div>

            {/* Scratchpad Footer */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span className="font-mono text-[10px]">
                {scratchpadText.trim() ? scratchpadText.trim().split(/\s+/).length : 0} words &bull; {scratchpadText.length} chars
              </span>

              <div className="flex items-center gap-2">
                {scratchpadText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear scratchpad content?')) {
                        handleScratchpadChange('');
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 text-[10px] font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOpenConvertToTask}
                  disabled={!scratchpadText.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ZapIcon className="w-3.5 h-3.5 text-white" />
                  <span>Convert to Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Workstreams & Task Categories Overview */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="workstreams-overview-section">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Task Categories & Focus Areas</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Strategic areas organizing your goals, projects & tasks</p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Add new category"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="space-y-3">
              {workstreams.map((ws) => (
                <div key={ws.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 hover:border-blue-200 transition-all group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900">{ws.name}</h4>
                      <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded uppercase">
                        Priority {ws.priorityWeight}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCategory(ws)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-slate-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      title={`Edit ${ws.name}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                  {ws.description && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ws.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2 pt-2 border-t border-slate-200/60">
                    <span><strong className="text-slate-700 font-bold">{ws._count?.goals || 0}</strong> Goals</span>
                    <span>&bull;</span>
                    <span><strong className="text-slate-700 font-bold">{ws._count?.projects || 0}</strong> Projects</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4" id="active-projects-section">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Active Projects</h3>
              {selectedWorkstreamId !== 'ALL' && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Filtered by Category
                </span>
              )}
            </div>
            {(() => {
              const filteredProjects = activeProjects.filter((proj) => {
                if (selectedWorkstreamId === 'ALL') return true;
                return proj.workstreamId === selectedWorkstreamId;
              });

              if (filteredProjects.length === 0) {
                return (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                    No active projects in this category.
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filteredProjects.map((proj) => (
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
              );
            })()}
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

      {/* Create Task Category Modal */}
      {isCreateCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add New Task Category</h3>
                <p className="text-xs text-slate-500">Create a strategic workstream to organize execution</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCategoryOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => void handleCreateCategorySubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Study English, Freelancing, AI Engineering"
                  disabled={isSubmittingCategory}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Purpose, curriculum, or delivery outcomes..."
                  disabled={isSubmittingCategory}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Priority Weight (1 - 10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newCategoryPriority}
                  onChange={(e) => setNewCategoryPriority(Number(e.target.value))}
                  disabled={isSubmittingCategory}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCategoryOpen(false)}
                  disabled={isSubmittingCategory}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-sm text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isSubmittingCategory ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Scratchpad to Task Modal */}
      {isConvertToTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Convert Note to Task</h3>
                <p className="text-xs text-slate-500">Turn your scratchpad note into an executable task</p>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertToTaskOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => void handleConvertToTaskSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={convertTitle}
                  onChange={(e) => setConvertTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign to Project *
                </label>
                <select
                  required
                  value={convertProjectId}
                  onChange={(e) => setConvertProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="">Select a project...</option>
                  {data?.activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.workstream ? `(${p.workstream.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  value={convertDescription}
                  onChange={(e) => setConvertDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={convertPriority}
                    onChange={(e) => setConvertPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="P0">P0 - Critical</option>
                    <option value="P1">P1 - High</option>
                    <option value="P2">P2 - Medium</option>
                    <option value="P3">P3 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    value={convertEstimateMinutes}
                    onChange={(e) => setConvertEstimateMinutes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConvertToTaskOpen(false)}
                  disabled={isConverting}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-sm text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isConverting ? 'Creating Task...' : 'Create Executable Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Category / Workstream</h3>
                <p className="text-xs text-slate-500">Update category name, focus, or status</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => void handleUpdateCategorySubmit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="e.g. Study English (formerly Freelance)"
                  disabled={isUpdatingCategory}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editCategoryDesc}
                  onChange={(e) => setEditCategoryDesc(e.target.value)}
                  placeholder="Strategic description..."
                  disabled={isUpdatingCategory}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Weight
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editCategoryPriority}
                    onChange={(e) => setEditCategoryPriority(Number(e.target.value))}
                    disabled={isUpdatingCategory}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={editCategoryStatus}
                    onChange={(e) => setEditCategoryStatus(e.target.value as WorkstreamStatus)}
                    disabled={isUpdatingCategory}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  disabled={isUpdatingCategory}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-sm text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCategory}
                  className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isUpdatingCategory ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
