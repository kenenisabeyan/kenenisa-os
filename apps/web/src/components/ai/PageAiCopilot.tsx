import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { sendChatMessage, confirmActionProposal } from '../../features/intelligence/api.js';
import type { ActionProposalDto, PageContextInput } from '@kenenisa-os/shared';
import { useToast } from '../ui/Toast.js';

export interface PageAiAction {
  label: string;
  prompt: string;
  icon?: string;
}

interface PageAiCopilotProps {
  pageType: string;
  entityId?: string;
  entityTitle?: string;
  suggestedActions?: PageAiAction[];
}

type DrawerMode = 'normal' | 'expanded';
type EngineMode = 'grounded' | 'gemini-pro' | 'gemini-flash';

export const PageAiCopilot: React.FC<PageAiCopilotProps> = ({
  pageType,
  entityId,
  entityTitle,
  suggestedActions = [],
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('normal');
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; copied?: boolean }>>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProposal, setActiveProposal] = useState<ActionProposalDto | null>(null);
  const [executingProposal, setExecutingProposal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('Grounded Intelligence');
  const [engineMode, setEngineMode] = useState<EngineMode>('grounded');

  // Dynamic context filter scopes
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['goals', 'tasks', 'graduation']);

  // Floating pill draggable position state
  const [dockSide, setDockSide] = useState<'right' | 'left'>(() => {
    try {
      return (localStorage.getItem('kenenisa_copilot_dock_side') as 'right' | 'left') || 'right';
    } catch {
      return 'right';
    }
  });
  const [customOffsetY, setCustomOffsetY] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('kenenisa_copilot_dock_offset_y');
      return saved ? parseFloat(saved) : null;
    } catch {
      return null;
    }
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const pillRef = useRef<HTMLButtonElement | null>(null);

  // Keyboard shortcut listener (Ctrl+J or Cmd+J to toggle, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Global event listener for external open triggers (e.g. AppLayout header button)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-copilot', handleOpen);
    return () => window.removeEventListener('open-ai-copilot', handleOpen);
  }, []);

  // Draggable logic for touch & mouse
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const deltaX = Math.abs(clientX - dragStartRef.current.x);
    const deltaY = Math.abs(clientY - dragStartRef.current.y);
    if (deltaX > 6 || deltaY > 6) {
      hasMovedRef.current = true;
      const windowHeight = window.innerHeight;
      const clampedY = Math.max(80, Math.min(windowHeight - 120, clientY));
      setCustomOffsetY(clampedY);
    }
  }, []);

  const handlePointerUp = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (hasMovedRef.current) {
      const windowWidth = window.innerWidth;
      const newDock = clientX < windowWidth / 2 ? 'left' : 'right';
      setDockSide(newDock);
      try {
        localStorage.setItem('kenenisa_copilot_dock_side', newDock);
        if (customOffsetY !== null) {
          localStorage.setItem('kenenisa_copilot_dock_offset_y', String(customOffsetY));
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [customOffsetY]);

  // Setup mouse move/up listeners on window when dragging
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handlePointerUp(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches[0]) handlePointerUp(e.changedTouches[0].clientX);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Dynamic contextual actions
  const defaultActions: Record<string, PageAiAction[]> = {
    projects: [
      { label: 'Explain Project Status', prompt: `Explain the current status, milestones, and pending deliverables for project ${entityTitle || 'this project'}.` },
      { label: 'Identify Blockers', prompt: `Identify any blocked tasks, delayed milestones, or dependencies for project ${entityTitle || 'this project'}.` },
      { label: 'Recommend Next Action', prompt: `What is the single most impactful Next Best Action to execute right now for ${entityTitle || 'this project'}?` },
      { label: 'Audit Missing Evidence', prompt: `Audit verifiable evidence for ${entityTitle || 'this project'}. What code commits or documents are missing?` },
      { label: 'Graduation Impact', prompt: `How does ${entityTitle || 'this project'} contribute to my ASTU graduation milestones and final defense?` },
    ],
    graduation: [
      { label: 'Audit Defense Readiness', prompt: 'Audit my overall graduation defense readiness across Individual Project A and Group Project B.' },
      { label: 'Check Delayed Milestones', prompt: 'List all delayed graduation milestones and identify what prerequisite tasks are needed to unblock them.' },
      { label: 'Review Academic Deadlines', prompt: 'Reconcile upcoming ASTU course exams and assignment deadlines against project milestones.' },
      { label: 'Next Graduation Step', prompt: 'What is the immediate priority milestone I should execute today for graduation?' },
    ],
    tasks: [
      { label: 'Triage Blocked Tasks', prompt: 'Analyze all BLOCKED tasks and recommend the optimal sequence of prerequisite unblocking.' },
      { label: 'Calculate Next Best Action', prompt: 'Explain the mathematical scoring factors for my current Next Best Action task.' },
      { label: 'Capacity Optimization', prompt: 'Audit my planned time-blocks today against my daily deep work capacity limit.' },
    ],
    learning: [
      { label: 'Analyze Skill Gaps', prompt: 'Compare my current engineering skills against graduation project and career requirements.' },
      { label: 'Recommend Practice Session', prompt: 'Recommend a high-impact learning session to practice my weakest software or AI engineering skill.' },
    ],
    career: [
      { label: 'Generate Qualification Pitch', prompt: `Draft a qualification pitch highlighting my verified code evidence and completed projects.` },
      { label: 'Missing Requirements', prompt: 'Identify missing requirements or evidence needed to become a compelling candidate.' },
    ],
    reviews: [
      { label: 'Auto-Draft Retrospective', prompt: 'Generate a factual weekly retrospective summary based on tasks completed and learning minutes logged.' },
      { label: 'Analyze Capacity Variance', prompt: 'Compare my planned focus hours against actual output this past week.' },
    ],
    goals: [
      { label: 'Align with Graduation', prompt: 'Check if all active strategic goals properly support ASTU graduation milestones and career goals.' },
      { label: 'Identify Stagnant Goals', prompt: 'Identify goals with no project progress or delayed deliverables over the last 14 days.' },
      { label: 'Propose Goal Action', prompt: 'What concrete project milestone or task should be executed today to advance my highest-priority goal?' },
    ],
    workstreams: [
      { label: 'Workstream Health Check', prompt: 'Audit workstream health across Graduation, Engineering, and EDOT to ensure proper focus balance.' },
      { label: 'Capacity Allocation', prompt: 'Audit active workstream capacity allocation to prevent academic neglect.' },
    ],
    academics: [
      { label: 'Semester Course Audit', prompt: 'Audit all enrolled ASTU courses, upcoming assignments, exams, and lecture obligations.' },
      { label: 'Study Hours Allocation', prompt: 'Analyze academic course study hours versus graduation project engineering hours.' },
      { label: 'Academic Risk Detection', prompt: 'Highlight any academic obligations or deadlines approaching within the next 7 days.' },
    ],
    evidence: [
      { label: 'Audit Verifiable Artifacts', prompt: 'Audit all submitted evidence (code commits, pull requests, docs) against graduation deliverables.' },
      { label: 'Identify Unverified Skills', prompt: 'Which engineering and AI skills currently lack linked proof or verified artifacts?' },
      { label: 'Graduation Evidence Packet', prompt: 'Summarize the verifiable evidence portfolio ready for ASTU final project defense.' },
    ],
    results: [
      { label: 'Synthesize Measured Results', prompt: 'Synthesize measured key results across all completed projects and strategic goals.' },
      { label: 'Outcome Impact Score', prompt: 'Calculate the tangible outcome of completed deliverables on graduation and career readiness.' },
    ],
    analytics: [
      { label: 'Cross-Module Velocity Trends', prompt: 'Analyze trends in task completion rate, deep work focus hours, and blocker resolution time.' },
      { label: 'Time Allocation Audit', prompt: 'Evaluate whether actual logged hours align with strategic workstream priorities.' },
    ],
    settings: [
      { label: 'Security Posture Audit', prompt: 'Audit my active device sessions, security configuration, and recent audit logs.' },
      { label: 'Capacity Configuration', prompt: 'Evaluate my daily and weekly deep work capacity limits against actual historical focus performance.' },
      { label: 'Access Policy Check', prompt: 'Verify user access roles and permissions for system users across OWNER, ADMIN, and USER.' },
    ],
    executive: [
      { label: 'Executive Briefing', prompt: 'Provide an executive high-level summary of overall system status, active milestones, and immediate delivery blockers.' },
      { label: 'Strategic Risk Assessment', prompt: 'Identify systemic risks across graduation deliverables, engineering workstreams, and capacity balance.' },
      { label: 'Capacity Variance', prompt: 'Analyze planned capacity against verified output across all active projects.' },
    ],
    integrations: [
      { label: 'Audit Sync Health', prompt: 'Audit the connection status, last sync timestamp, and error rates across all external providers.' },
      { label: 'GitHub Commit Ingestion', prompt: 'Explain recent code commit and pull request evidence ingested into the evidence vault.' },
      { label: 'Calendar Sync Status', prompt: 'Verify Google Calendar sync alignment with planned deep work time blocks.' },
    ],
    'work-intelligence': [
      { label: 'Bottleneck Triage', prompt: 'Analyze all blocked and overdue tasks across active workstreams and recommend unblocking steps.' },
      { label: 'Deep Work Velocity', prompt: 'Audit deep work ratio and focus consistency across projects over the past 30 days.' },
      { label: 'Context Switching Friction', prompt: 'Identify workstream switching frequency and recommend batching optimizations.' },
    ],
    dashboard: [
      { label: 'Executive Synthesis', prompt: 'Provide an executive synthesis of where I stand today across Graduation, Engineering, and Capacity.' },
      { label: 'Top 3 Priorities', prompt: 'Identify the top 3 critical items requiring my immediate attention today.' },
    ],
  };

  const dynamicEntityActions: PageAiAction[] = entityTitle
    ? [
        { label: `Audit "${entityTitle.slice(0, 16)}..."`, prompt: `Analyze the current delivery status, dependencies, and verifiable milestones for ${entityTitle}.` },
        { label: `Unblock "${entityTitle.slice(0, 16)}..."`, prompt: `Identify what prerequisite steps or resources are needed to unblock and advance ${entityTitle}.` },
      ]
    : [];

  const actions = suggestedActions.length > 0
    ? suggestedActions
    : [...dynamicEntityActions, ...(defaultActions[pageType] || defaultActions.dashboard)];

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userText = promptText.trim();
    setInputText('');
    const msgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: msgId, role: 'user', content: userText }]);
    setLoading(true);
    setActiveProposal(null);

    const pageCtx: PageContextInput = {
      pageType,
      entityId,
      entityTitle,
      activeFilters: {
        scopes: selectedScopes,
        engineMode,
      },
    };

    try {
      const res = await sendChatMessage({
        message: userText,
        pageContext: pageCtx,
      });

      const assistantMsgId = `asst-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: res.message.content },
      ]);
      if (res.message.metadata?.providerName) {
        setActiveProvider(res.message.metadata.providerName as string);
      }
      if (res.proposal) {
        setActiveProposal(res.proposal);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err.message || 'Failed to process intelligence request.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, copied: true } : m)),
      );
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, copied: false } : m)),
        );
      }, 2000);
      showToast('Copied to clipboard', 'info');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setActiveProposal(null);
    showToast('Conversation cleared', 'info');
  };

  const handleConfirmAction = async (confirm: boolean) => {
    if (!activeProposal) return;
    setExecutingProposal(true);
    try {
      const res = await confirmActionProposal(activeProposal.id, confirm);
      if (res.success) {
        showToast('Action confirmed and executed successfully!', 'success');
        setMessages((prev) => [
          ...prev,
          {
            id: `proposal-${Date.now()}`,
            role: 'assistant',
            content: `✓ Action confirmed & persisted: ${activeProposal.summary}`,
          },
        ]);
        setActiveProposal(null);
      } else {
        showToast('Action proposal cancelled.', 'info');
        setActiveProposal(null);
      }
    } catch (err: any) {
      showToast(`Action execution failed: ${err.message}`, 'error');
    } finally {
      setExecutingProposal(false);
    }
  };

  // Determine button positioning styles dynamically
  const buttonStyle: React.CSSProperties = {
    zIndex: 9999,
    position: 'fixed',
    ...(customOffsetY !== null
      ? { top: `${customOffsetY}px` }
      : { bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }),
    ...(dockSide === 'left' ? { left: '1rem' } : { right: '1rem' }),
  };

  return (
    <>
      {/* Page Action Quick Pills */}
      <div className="flex flex-wrap items-center gap-2 py-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          AI Copilot:
        </span>
        {actions.slice(0, 4).map((action, idx) => (
          <button
            key={idx}
            onClick={() => {
              setIsOpen(true);
              handleSendPrompt(action.prompt);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full shadow-2xs transition-colors max-w-full"
            title={action.label}
          >
            <span className="shrink-0 text-blue-600">✦</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{action.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
        >
          <span>Ask AI...</span>
        </button>
      </div>

      {/* Floating Action Button & Slide-Out Drawer - Portaled directly to document.body with fixed z-[9999] */}
      {typeof document !== 'undefined' &&
        createPortal(
          <>
            {/* Draggable & Dockable Floating Action Button */}
            {!isOpen && (
              <button
                ref={pillRef}
                onClick={() => {
                  if (!hasMovedRef.current) {
                    setIsOpen(true);
                  }
                }}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                }}
                style={buttonStyle}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-full shadow-2xl shadow-blue-900/30 border border-blue-300/50 transition-transform active:scale-95 select-none cursor-grab active:cursor-grabbing ring-4 ring-blue-500/20 backdrop-blur-xs group"
                title="Open AI Command Copilot (Drag to reposition, Ctrl+J to toggle)"
                aria-label="Open AI Command Copilot"
              >
                <span className="text-slate-300 opacity-60 group-hover:opacity-100 text-[10px] hidden sm:inline select-none">
                  ⋮⋮
                </span>
                <span className="text-sm sm:text-base animate-pulse">✦</span>
                <span className="text-xs font-bold tracking-tight">AI Copilot</span>
                <kbd className="hidden md:inline-flex ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-800/60 text-blue-200 border border-blue-400/30">
                  Ctrl+J
                </kbd>
              </button>
            )}

            {/* Backdrop overlay for Copilot drawer */}
            {isOpen && (
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
                style={{ zIndex: 9998, position: 'fixed' }}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Dynamic Resizable Slide-Out AI Copilot Drawer */}
            {isOpen && (
              <div
                style={{ zIndex: 9999, position: 'fixed' }}
                className={`fixed inset-y-0 right-0 z-[9999] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 ${
                  drawerMode === 'expanded' ? 'w-full sm:w-[740px]' : 'w-full sm:w-[440px]'
                }`}
              >
                {/* Header with Adaptive Engine & View Controls */}
                <div className="p-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        ✦
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">KENENISA OS Copilot</h3>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {activeProvider}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Context: <span className="font-semibold text-slate-700 capitalize">{pageType}</span>
                          {entityTitle ? ` • ${entityTitle.slice(0, 24)}...` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Window Controls */}
                    <div className="flex items-center gap-1">
                      {/* Clear Conversation */}
                      <button
                        onClick={handleClearChat}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                        title="Clear conversation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>

                      {/* Expand / Collapse Mode (Desktop) */}
                      <button
                        onClick={() => setDrawerMode((prev) => (prev === 'normal' ? 'expanded' : 'normal'))}
                        className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                        title={drawerMode === 'normal' ? 'Expand drawer' : 'Collapse drawer'}
                      >
                        {drawerMode === 'normal' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v4m0-4h4m6 6l5-5m-5 5h4m-4 0V4m-6 16l-5-5m5 5v-4m0 4H4m16 0l-5-5m5 5h-4m4 0v-4" />
                          </svg>
                        )}
                      </button>

                      {/* Close Drawer */}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2 py-0.5 rounded-lg hover:bg-slate-200/50"
                        title="Close Copilot (Esc)"
                      >
                        &times;
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Reasoning Engine & Context Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-200/60 text-[10px]">
                    <div className="flex items-center gap-1 font-semibold text-slate-600">
                      <span>Engine:</span>
                      <select
                        value={engineMode}
                        onChange={(e) => setEngineMode(e.target.value as EngineMode)}
                        className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-800 cursor-pointer hover:border-blue-400"
                      >
                        <option value="grounded">⚡ Grounded Live DB</option>
                        <option value="gemini-pro">🧠 Gemini 1.5 Pro</option>
                        <option value="gemini-flash">🚀 Gemini Flash</option>
                      </select>
                    </div>

                    {/* Context scope pills */}
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 font-medium">Scopes:</span>
                      {[
                        { id: 'goals', label: '🎯 Goals' },
                        { id: 'tasks', label: '📋 Tasks' },
                        { id: 'graduation', label: '🎓 Grad' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => toggleScope(s.id)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                            selectedScopes.includes(s.id)
                              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                              : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 space-y-2.5">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-xs">
                        ✦
                      </div>
                      <div className="font-bold text-sm text-slate-800">Dynamic Operating Intelligence</div>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Reasoning over live verified PostgreSQL state. Ask any question, triage bottlenecks, or launch one of the actions below:
                      </p>
                      <div className="pt-2 flex flex-col gap-1.5 text-left max-w-md mx-auto">
                        {actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendPrompt(act.prompt)}
                            className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 rounded-xl text-left transition-all font-medium flex items-center gap-2 group hover:border-blue-200 shadow-2xs"
                          >
                            <span className="text-blue-500 group-hover:scale-125 transition-transform">✦</span>
                            <span className="truncate">{act.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`group relative p-3 rounded-2xl border leading-relaxed transition-all ${
                          m.role === 'user'
                            ? 'bg-blue-50 text-blue-900 border-blue-200 ml-6 shadow-2xs'
                            : 'bg-white text-slate-800 border-slate-200 mr-2 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          <span>{m.role === 'user' ? 'Operator' : 'AI Intelligence Core'}</span>
                          {m.role === 'assistant' && (
                            <button
                              onClick={() => handleCopyMessage(m.id, m.content)}
                              className="text-slate-400 hover:text-blue-600 font-medium text-[10px] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                              title="Copy response"
                            >
                              {m.copied ? (
                                <span className="text-emerald-600 font-bold">✓ Copied</span>
                              ) : (
                                <span>Copy</span>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">{m.content}</div>
                      </div>
                    ))
                  )}

                  {loading && (
                    <div className="flex items-center gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs shadow-2xs">
                      <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span className="font-medium">Synthesizing live {pageType} operating state...</span>
                    </div>
                  )}

                  {/* Active Action Proposal Card */}
                  {activeProposal && (
                    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        <span>⚠️</span>
                        <span>Action Proposal Requires Operator Confirmation</span>
                      </div>
                      <div className="text-xs text-amber-950 font-semibold leading-relaxed">
                        {activeProposal.summary}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/70">
                        <button
                          onClick={() => handleConfirmAction(false)}
                          disabled={executingProposal}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleConfirmAction(true)}
                          disabled={executingProposal}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
                        >
                          {executingProposal ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Executing...</span>
                            </>
                          ) : (
                            <span>Confirm & Execute</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Input */}
                <div className="p-3 border-t border-slate-200 bg-white pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendPrompt(inputText);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Ask AI about ${pageType}... (or run triage)`}
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/50 hover:bg-white transition-colors"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || loading}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>,
          document.body,
        )}
    </>
  );
};
