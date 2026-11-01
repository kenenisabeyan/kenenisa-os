import React, { useState } from 'react';
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

export const PageAiCopilot: React.FC<PageAiCopilotProps> = ({
  pageType,
  entityId,
  entityTitle,
  suggestedActions = [],
}) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProposal, setActiveProposal] = useState<ActionProposalDto | null>(null);
  const [executingProposal, setExecutingProposal] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('Grounded Intelligence');

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
    dashboard: [
      { label: 'Executive Synthesis', prompt: 'Provide an executive synthesis of where I stand today across Graduation, Engineering, and Capacity.' },
      { label: 'Top 3 Priorities', prompt: 'Identify the top 3 critical items requiring my immediate attention today.' },
    ],
  };

  const actions = suggestedActions.length > 0 ? suggestedActions : defaultActions[pageType] || defaultActions.dashboard;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || loading) return;

    const userText = promptText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);
    setActiveProposal(null);

    const pageCtx: PageContextInput = {
      pageType,
      entityId,
      entityTitle,
    };

    try {
      const res = await sendChatMessage({
        message: userText,
        pageContext: pageCtx,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.message.content }]);
      if (res.message.metadata?.providerName) {
        setActiveProvider(res.message.metadata.providerName as string);
      }
      if (res.proposal) {
        setActiveProposal(res.proposal);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Failed to process intelligence request.'}` },
      ]);
    } finally {
      setLoading(false);
    }
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
          { role: 'assistant', content: `✓ Action confirmed & persisted: ${activeProposal.summary}` },
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
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full shadow-2xs transition-colors"
          >
            <span>✦</span>
            <span>{action.label}</span>
          </button>
        ))}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
        >
          <span>Ask AI...</span>
        </button>
      </div>

      {/* Floating Action Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 select-none"
          title="Open AI Command Copilot"
        >
          <span className="text-base">✦</span>
          <span className="text-xs font-bold tracking-tight">AI Copilot</span>
        </button>
      )}

      {/* Slide-Out AI Copilot Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ✦
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">KENENISA OS Copilot</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeProvider}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Context: <span className="font-semibold text-slate-700 capitalize">{pageType}</span>
                  {entityTitle ? ` • ${entityTitle.slice(0, 20)}...` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2 py-0.5 rounded-lg hover:bg-slate-200/50"
            >
              &times;
            </button>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  ✦
                </div>
                <div className="font-semibold text-slate-700">Page-Aware Intelligence Core</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Ask any question about {pageType}, run bottleneck triage, or click one of the suggested actions below:
                </p>
                <div className="pt-3 flex flex-col gap-1.5 text-left">
                  {actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendPrompt(act.prompt)}
                      className="px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-lg text-left transition-colors font-medium"
                    >
                      ✦ {act.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-50 text-blue-900 border-blue-200 ml-6'
                      : 'bg-white text-slate-800 border-slate-200 mr-2 shadow-2xs whitespace-pre-wrap'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                    {m.role === 'user' ? 'Operator' : 'AI Command Core'}
                  </div>
                  <div>{m.content}</div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                <svg className="animate-spin h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing {pageType} operating state...</span>
              </div>
            )}

            {/* Active Action Proposal Card */}
            {activeProposal && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  <span>⚠️</span>
                  <span>Action Proposal Requires Confirmation</span>
                </div>
                <div className="text-xs text-amber-950 font-medium">{activeProposal.summary}</div>
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-200/60">
                  <button
                    onClick={() => handleConfirmAction(false)}
                    disabled={executingProposal}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleConfirmAction(true)}
                    disabled={executingProposal}
                    className="px-3 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs disabled:opacity-50"
                  >
                    {executingProposal ? 'Executing...' : 'Confirm & Execute'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-slate-200 bg-white">
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
                placeholder={`Ask AI about ${pageType}...`}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-2xs"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
