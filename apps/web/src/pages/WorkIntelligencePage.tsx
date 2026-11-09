import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZapIcon } from '../components/common/ZapIcon.js';
import { fetchWorkstreams } from '../features/workstreams/api.js';
import { fetchGoals } from '../features/goals/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { fetchMilestones } from '../features/milestones/api.js';
import { fetchTasks, startTask, reopenTask, completeTask, updateTask } from '../features/tasks/api.js';
import { sendChatMessage } from '../features/intelligence/api.js';
import type {
  WorkstreamDto,
  GoalDto,
  ProjectDto,
  MilestoneDto,
  TaskDto,
} from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';
import { Badge } from '../components/ui/Badge.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

export const WorkIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [workstreams, setWorkstreams] = useState<WorkstreamDto[]>(
    () => getCachedApiData<WorkstreamDto[]>('/api/v1/workstreams') || [],
  );
  const [goals, setGoals] = useState<GoalDto[]>(
    () => getCachedApiData<GoalDto[]>('/api/v1/goals') || [],
  );
  const [projects, setProjects] = useState<ProjectDto[]>(
    () => getCachedApiData<ProjectDto[]>('/api/v1/projects') || [],
  );
  const [milestones, setMilestones] = useState<MilestoneDto[]>(
    () => getCachedApiData<MilestoneDto[]>('/api/v1/milestones') || [],
  );
  const [tasks, setTasks] = useState<TaskDto[]>(
    () => getCachedApiData<TaskDto[]>('/api/v1/tasks') || [],
  );
  const [loading, setLoading] = useState(
    () => workstreams.length === 0 && projects.length === 0 && tasks.length === 0,
  );
  const [error, setError] = useState<string | null>(null);

  // Hierarchy expand state & search
  const [expandedWs, setExpandedWs] = useState<Record<string, boolean>>(() => {
    const cached = getCachedApiData<WorkstreamDto[]>('/api/v1/workstreams') || [];
    const expMap: Record<string, boolean> = {};
    cached.forEach((w) => { expMap[w.id] = true; });
    return expMap;
  });
  const [hierarchySearch, setHierarchySearch] = useState<string>('');

  // AI Triage state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (workstreams.length === 0 && projects.length === 0 && tasks.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const [wsRes, goalsRes, projRes, msRes, tasksRes] = await Promise.allSettled([
        fetchWorkstreams({ pageSize: 50 }),
        fetchGoals({ pageSize: 50 }),
        fetchProjects({ pageSize: 50 }),
        fetchMilestones(),
        fetchTasks({ pageSize: 100 }),
      ]);

      if (wsRes.status === 'fulfilled') {
        setWorkstreams(wsRes.value);
        setExpandedWs((prev) => {
          const next = { ...prev };
          wsRes.value.forEach((w: WorkstreamDto) => {
            if (next[w.id] === undefined) next[w.id] = true;
          });
          return next;
        });
      }
      if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value);
      if (projRes.status === 'fulfilled') setProjects(projRes.value);
      if (msRes.status === 'fulfilled') setMilestones(msRes.value);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value);

      if (wsRes.status === 'rejected' && projRes.status === 'rejected' && tasksRes.status === 'rejected') {
        setError('Failed to load work intelligence. Please verify your connection.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load work intelligence');
    } finally {
      setLoading(false);
    }
  }, [workstreams.length, projects.length, tasks.length]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const toggleExpand = (id: string) => {
    setExpandedWs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    workstreams.forEach((w) => { allExpanded[w.id] = true; });
    setExpandedWs(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    workstreams.forEach((w) => { allCollapsed[w.id] = false; });
    setExpandedWs(allCollapsed);
  };

  // 1-Click Bottleneck Resolvers
  const handleQuickUnblock = async (taskId: string, title: string) => {
    try {
      await reopenTask(taskId);
      showToast(`Task "${title}" unblocked and moved to READY`, 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to unblock task', 'error');
    }
  };

  const handleQuickReschedule = async (taskId: string, title: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await updateTask(taskId, { dueDate: todayStr });
      showToast(`Task "${title}" rescheduled for today`, 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reschedule task', 'error');
    }
  };

  const handleQuickStart = async (taskId: string, title: string) => {
    try {
      await startTask(taskId);
      showToast(`Task "${title}" started (IN_PROGRESS)`, 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to start task', 'error');
    }
  };

  const handleQuickComplete = async (taskId: string, title: string) => {
    try {
      await completeTask(taskId);
      showToast(`Task "${title}" marked as COMPLETED`, 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to complete task', 'error');
    }
  };

  // AI-Powered Bottleneck Triage
  const handleAiTriage = async () => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const blockedTitles = blockedTasks.map((t) => `- "${t.title}" (Priority: ${t.priority})`).join('\n');
      const overdueTitles = overdueTasks.map((t) => `- "${t.title}" (Due: ${t.dueDate})`).join('\n');
      const prompt = `Perform an executive triage on my current engineering bottlenecks:
Blocked Tasks (${blockedTasks.length}):
${blockedTitles || 'None'}

Overdue Tasks (${overdueTasks.length}):
${overdueTitles || 'None'}

Recommend specific, high-leverage steps to unblock progress, sequence dependencies, and protect delivery milestones.`;
      const res = await sendChatMessage({ message: prompt });
      setAiAnalysis(res.message.content);
      showToast('AI Bottleneck Triage generated', 'info');
    } catch (err: unknown) {
      setAiAnalysis(err instanceof Error ? err.message : 'Failed to generate AI triage');
    } finally {
      setAiLoading(false);
    }
  };

  // Bottlenecks computation
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const taskWithBlockers = tasks.filter((t) => t.blockingDependencies && t.blockingDependencies.length > 0);
  const unscheduledReadyTasks = tasks.filter((t) => t.status === 'READY' && !t.dueDate);
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  );

  // Workload distribution
  const totalTasks = tasks.length || 1;
  const readyCount = tasks.filter((t) => t.status === 'READY').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const blockedCount = blockedTasks.length;

  return (
    <div className="space-y-8" id="work-intelligence-page">
      <PageHeader
        title="Work Intelligence & Bottleneck Analysis"
        description="Comprehensive visibility into operating structure, task dependencies, workload concentration, and bottleneck constraints."
        breadcrumbs={[{ label: 'Command Center' }, { label: 'Work Intelligence' }]}
        actions={
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/app/tasks')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] sm:text-xs shadow-xs transition-colors cursor-pointer"
            >
              Task Engine
            </button>
            <button
              onClick={() => navigate('/app/executive')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Executive Overview</span>
            </button>
          </div>
        }
      />

      <PageAiCopilot pageType="work-intelligence" />

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          {/* Workload Concentration Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Ready Work */}
            <div className="relative p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-500 via-cyan-400/40 to-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-blue-500/15 blur-lg pointer-events-none group-hover:bg-blue-500/25 transition-all duration-300" />
              <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full shadow-[0_0_8px_rgba(34,211,238,0.7)] pointer-events-none group-hover:left-2 group-hover:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] sm:rounded-[22px] p-4 sm:p-5 space-y-2.5 sm:space-y-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{'// READY WORK'}</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{readyCount}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Share of Total</span>
                    <span className="font-black text-slate-900">{Math.round((readyCount / totalTasks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((readyCount / totalTasks) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="relative p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-500 via-purple-400/40 to-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-indigo-500/15 blur-lg pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-300" />
              <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full shadow-[0_0_8px_rgba(192,132,252,0.7)] pointer-events-none group-hover:left-2 group-hover:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] sm:rounded-[22px] p-4 sm:p-5 space-y-2.5 sm:space-y-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{'// IN PROGRESS'}</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{inProgressCount}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Active Execution</span>
                    <span className="font-black text-slate-900">{Math.round((inProgressCount / totalTasks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((inProgressCount / totalTasks) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blocked Work */}
            <div className="relative p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rose-500 via-rose-300/40 to-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-rose-500/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-rose-500/15 blur-lg pointer-events-none group-hover:bg-rose-500/25 transition-all duration-300" />
              <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-rose-500 to-transparent rounded-full shadow-[0_0_8px_rgba(244,63,94,0.7)] pointer-events-none group-hover:left-2 group-hover:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] sm:rounded-[22px] p-4 sm:p-5 space-y-2.5 sm:space-y-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{'// BLOCKED WORK'}</span>
                  <span className={`w-2 h-2 rounded-full ${blockedCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                </div>
                <p className={`text-2xl sm:text-3xl font-black tracking-tight ${blockedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  {blockedCount}
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Blocked Ratio</span>
                    <span className={`font-black ${blockedCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {Math.round((blockedCount / totalTasks) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((blockedCount / totalTasks) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="relative p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-500 via-teal-400/40 to-slate-200/60 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3/4 h-10 bg-emerald-500/15 blur-lg pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-300" />
              <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full shadow-[0_0_8px_rgba(52,211,153,0.7)] pointer-events-none group-hover:left-2 group-hover:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] sm:rounded-[22px] p-4 sm:p-5 space-y-2.5 sm:space-y-3 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{'// COMPLETED'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{doneCount}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                    <span>Completion Rate</span>
                    <span className="font-black text-slate-900">{Math.round((doneCount / totalTasks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((doneCount / totalTasks) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Bottlenecks & Blocker Chain */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Bottleneck Analysis */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>Active Execution Bottlenecks</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">
                        {blockedTasks.length + overdueTasks.length} Flags
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">System detected tasks holding up progress or past due date</p>
                  </div>

                  <button
                    onClick={() => void handleAiTriage()}
                    disabled={aiLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    {aiLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ AI Triage Advisor</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Advice Output Banner */}
                {aiAnalysis && (
                  <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 border border-indigo-200 rounded-2xl p-4 space-y-2 relative shadow-2xs">
                    <button
                      onClick={() => setAiAnalysis(null)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                      🤖 AI Executive Triage Recommendation
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {aiAnalysis}
                    </p>
                  </div>
                )}

                {blockedTasks.length === 0 && overdueTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active task bottlenecks or overdue items detected. Execution flow is clear.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blockedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-rose-300 transition-all shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 border border-rose-300">
                              BLOCKED
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                              {t.project?.name || 'General Project'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 break-words">{t.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => void handleQuickUnblock(t.id, t.title)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                            title="Unblock task and move to READY"
                          >
                            <ZapIcon className="w-3 h-3 text-white" />
                            <span>Unblock</span>
                          </button>
                          <button
                            onClick={() => navigate('/app/tasks')}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    ))}

                    {overdueTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:border-amber-300 transition-all shadow-2xs"
                      >
                        <div className="space-y-1.5 min-w-0 w-full sm:w-auto">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              OVERDUE
                            </span>
                            <Badge variant={t.priority} />
                            <span className="text-[10px] font-mono text-amber-700 font-semibold">
                              Due: {new Date(t.dueDate!).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 break-words">{t.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => void handleQuickReschedule(t.id, t.title)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                            title="Reschedule dueDate to today"
                          >
                            ⏱️ Today
                          </button>
                          <button
                            onClick={() => void handleQuickComplete(t.id, t.title)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                            title="Mark completed"
                          >
                            ✓ Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dependency Chain Viewer */}
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Task Dependency Chains & Prerequisites
                  </h3>
                  <p className="text-xs text-slate-500">Map of tasks dependent on completing prior prerequisite tasks</p>
                </div>

                {taskWithBlockers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active task dependency links defined. Link dependencies in Task Engine.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {taskWithBlockers.map((t) => (
                      <div key={t.id} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">{t.title}</span>
                          <Badge variant={t.status} />
                        </div>

                        <div className="pl-3 border-l-2 border-indigo-500 space-y-2">
                          <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                            Prerequisite Blockers:
                          </p>
                          {t.blockingDependencies?.map((dep: any) => (
                            <div key={dep.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                              <span className="font-semibold break-words">{dep.blockingTask?.title || dep.blockingTaskId}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 self-start sm:self-auto shrink-0">
                                {dep.blockingTask?.status || 'PENDING'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Unscheduled Ready Work & Quick Map */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Unscheduled Ready Work</h3>
                  <p className="text-xs text-slate-500">Tasks ready for execution without target schedule dates</p>
                </div>

                {unscheduledReadyTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                    All ready tasks are scheduled.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {unscheduledReadyTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-300 transition-all shadow-2xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{t.title}</h4>
                          <span className="text-[10px] font-mono text-slate-500">{t.estimateMinutes} min est</span>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => void handleQuickStart(t.id, t.title)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            title="Start Task"
                          >
                            ▶ Start
                          </button>
                          <button
                            onClick={() => void handleQuickComplete(t.id, t.title)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            title="Mark Done"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => navigate('/app/planning')}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Plan
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Work Map Hierarchy */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Active Work Hierarchy Map</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                    {workstreams.length} Workstream Nodes
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Full relational tree breakdown: Workstream → Goal → Project → Milestone → Tasks
                </p>
              </div>

              {/* Hierarchy Search & Expand Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter hierarchy..."
                  value={hierarchySearch}
                  onChange={(e) => setHierarchySearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium w-40 sm:w-48"
                />
                <button
                  onClick={handleExpandAll}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {workstreams
                .filter((ws) => {
                  if (!hierarchySearch.trim()) return true;
                  const query = hierarchySearch.toLowerCase();
                  const matchWs = ws.name.toLowerCase().includes(query);
                  const matchProjects = projects.some(
                    (p) => p.workstreamId === ws.id && p.name.toLowerCase().includes(query),
                  );
                  const matchGoals = goals.some(
                    (g) => g.workstreamId === ws.id && g.title.toLowerCase().includes(query),
                  );
                  return matchWs || matchProjects || matchGoals;
                })
                .map((ws) => {
                  const wsGoals = goals.filter((g) => g.workstreamId === ws.id);
                  const wsProjects = projects.filter((p) => p.workstreamId === ws.id);
                  const isExpanded = expandedWs[ws.id] ?? true;

                  return (
                    <div key={ws.id} className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/40">
                      <div
                        onClick={() => toggleExpand(ws.id)}
                        className="p-3.5 sm:p-5 bg-white border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                          <span className="text-xs text-slate-400 font-bold w-4 text-center mt-0.5 sm:mt-0">{isExpanded ? '▼' : '▶'}</span>
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                              Workstream Pillar ({ws.priorityWeight}/10 Weight)
                            </span>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">{ws.name}</h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-600 font-semibold pl-6 sm:pl-0">
                          <span>Goals: <strong className="text-slate-900">{wsGoals.length}</strong></span>
                          <span>Projects: <strong className="text-slate-900">{wsProjects.length}</strong></span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-slate-50/70">
                          {wsProjects.length === 0 ? (
                            <div className="text-xs text-slate-400 italic pl-3 sm:pl-6">No projects assigned under this workstream.</div>
                          ) : (
                            wsProjects.map((p) => {
                              const pMilestones = milestones.filter((m) => m.projectId === p.id);
                              const pTasks = tasks.filter((t) => t.projectId === p.id);

                              return (
                                <div key={p.id} className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 ml-2 sm:ml-6 shadow-2xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="space-y-0.5 min-w-0">
                                      <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                        Project
                                      </span>
                                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{p.name}</h4>
                                    </div>
                                    <Badge variant={p.status} />
                                  </div>

                                  <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                                    <span>Milestones: <strong className="text-slate-900">{pMilestones.length}</strong></span>
                                    <span>Tasks: <strong className="text-slate-900">{pTasks.length}</strong></span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>

  );
};
