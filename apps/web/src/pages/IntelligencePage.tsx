import React, { useState, useEffect, useRef } from 'react';
import type {
  ConversationDto,
  ConversationMessageDto,
  ActionProposalDto,
  UserMemoryDto,
} from '@kenenisa-os/shared';
import {
  sendChatMessage,
  confirmActionProposal,
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  fetchUserMemories,
  archiveUserMemory,
} from '../features/intelligence/api.js';

export const IntelligencePage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessageDto[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active Proposal State
  const [activeProposal, setActiveProposal] = useState<ActionProposalDto | null>(null);
  const [executingAction, setExecutingAction] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Context Summary
  const [contextSummary, setContextSummary] = useState<{
    todayTasksCount?: number;
    blockedTasksCount?: number;
    activeProjectsCount?: number;
    capacityMinutes?: number;
    nextBestActionTitle?: string;
  } | null>(null);

  // Memory Drawer
  const [showMemoryModal, setShowMemoryModal] = useState<boolean>(false);
  const [memories, setMemories] = useState<UserMemoryDto[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversationsList = React.useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err: unknown) {
      console.warn('Failed to load conversations:', err);
    }
  }, []);

  const loadMessages = React.useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const msgs = await fetchConversationMessages(id);
      setMessages(msgs);
      setActiveConversationId(id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversation messages';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversationsList();
  }, [loadConversationsList]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setActiveProposal(null);
    setContextSummary(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setLoading(true);
    setError(null);
    setActionSuccessMessage(null);

    // Optimistic user message update
    const tempUserMsg: ConversationMessageDto = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId || 'temp',
      userId: 'user',
      role: 'USER',
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await sendChatMessage({
        conversationId: activeConversationId || undefined,
        message: userMsg,
      });

      setActiveConversationId(res.conversationId);
      if (res.contextSummary) setContextSummary(res.contextSummary);
      if (res.proposal) setActiveProposal(res.proposal);

      await loadMessages(res.conversationId);
      await loadConversationsList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send message';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleActionConfirm = async (confirm: boolean) => {
    if (!activeProposal) return;
    setExecutingAction(true);
    try {
      const res = await confirmActionProposal(activeProposal.id, confirm);
      if (res.success) {
        setActionSuccessMessage(`Action confirmed & persisted successfully!`);
      } else {
        setActionSuccessMessage('Action proposal cancelled.');
      }
      setActiveProposal(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action execution failed';
      setError(msg);
    } finally {
      setExecutingAction(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      if (activeConversationId === id) {
        handleNewConversation();
      }
      await loadConversationsList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete conversation';
      setError(msg);
    }
  };

  const handleOpenMemories = async () => {
    try {
      const list = await fetchUserMemories();
      setMemories(list);
      setShowMemoryModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load user memories';
      setError(msg);
    }
  };

  const handleArchiveMemory = async (id: string) => {
    try {
      await archiveUserMemory(id);
      const list = await fetchUserMemories();
      setMemories(list);
    } catch (err: unknown) {
      console.warn('Failed to archive memory:', err);
    }
  };

  return (
    <div id="intelligence-page" className="min-h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span>KENENISA OS Intelligence Core</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#7e22ce] font-extrabold">
              ✦ AI Advisory Core
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Factual reasoning assistant grounded strictly in your personal operating system context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleOpenMemories()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            🧠 Operating Memory
          </button>
          <button
            onClick={handleNewConversation}
            className="px-3.5 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-[0.99]"
          >
            + New Conversation
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[500px] md:overflow-hidden">
        {/* Sidebar: Conversation History */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col space-y-3 overflow-y-auto max-h-44 md:max-h-none shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Conversations
          </h3>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500 p-2 italic">No conversations yet.</p>
          ) : (
            <div className="space-y-1.5">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    void loadMessages(c.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between group ${
                    activeConversationId === c.id
                      ? 'bg-blue-50 border border-blue-200 text-[#2563eb] font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 font-bold"
                    title="Delete conversation"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="md:col-span-3 bg-white border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden shadow-xs">
          {/* Context Transparency Banner (System State) */}
          {contextSummary && (
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3AB1EC] animate-pulse"></span>
                <span className="font-extrabold text-[#0284c7] uppercase tracking-wide text-[10px]">SYSTEM STATE ACTIVE:</span>
                <span className="font-semibold text-slate-700">
                  {contextSummary.activeProjectsCount} Projects · {contextSummary.todayTasksCount} Tasks · Capacity {contextSummary.capacityMinutes}m
                </span>
              </div>
              {contextSummary.nextBestActionTitle && (
                <span className="text-[#2563eb] font-bold truncate max-w-xs">
                  Next Best Action: {contextSummary.nextBestActionTitle}
                </span>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F8FAFC]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#7e22ce] flex items-center justify-center text-2xl font-bold shadow-xs">
                  ✦
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Ask KENENISA OS Intelligence</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Ask about your Next Best Action, daily capacity, blocked work, active projects, or pursuing career opportunities.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-w-lg w-full pt-2">
                  <button
                    onClick={() => setInputText('What should I work on next today?')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-left text-slate-700 hover:text-slate-900 transition-all shadow-xs font-medium"
                  >
                    🎯 What should I focus on next today?
                  </button>
                  <button
                    onClick={() => setInputText('Am I overloading my available capacity?')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-left text-slate-700 hover:text-slate-900 transition-all shadow-xs font-medium"
                  >
                    ⚡ Am I overloading my available capacity?
                  </button>
                  <button
                    onClick={() => setInputText('What opportunities am I currently pursuing?')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-left text-slate-700 hover:text-slate-900 transition-all shadow-xs font-medium"
                  >
                    💼 What opportunities am I pursuing?
                  </button>
                  <button
                    onClick={() => setInputText('Create a task called Finish API Docs')}
                    className="p-3 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-left text-slate-700 hover:text-slate-900 transition-all shadow-xs font-medium"
                  >
                    📝 Propose creating a new task...
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col space-y-2 ${
                    m.role === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                      m.role === 'USER'
                        ? 'bg-[#3B82F6] text-white rounded-br-none shadow-md font-medium'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-bl-none border-l-4 border-l-[#A855F7]'
                    }`}
                  >
                    <div className="font-extrabold text-[10px] uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                      {m.role === 'USER' ? (
                        <span>You</span>
                      ) : (
                        <span className="text-[#7e22ce] flex items-center gap-1">
                          <span>✦</span> AI ADVISORY
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Metadata: Facts, Inferences, Recommendations */}
                    {m.metadata && (
                      <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                        {Array.isArray(m.metadata.facts) && m.metadata.facts.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#15803d]">Facts:</span>
                            <ul className="list-disc list-inside text-slate-600">
                              {m.metadata.facts.map((f: unknown, idx: number) => (
                                <li key={idx}>{String(f)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(m.metadata.recommendations) && m.metadata.recommendations.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0284c7]">Recommendation:</span>
                            <ul className="list-disc list-inside text-slate-700 font-medium">
                              {m.metadata.recommendations.map((r: unknown, idx: number) => (
                                <li key={idx}>{String(r)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Proposal Confirmation Card */}
          {activeProposal && (
            <div className="bg-purple-50 border-t border-purple-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]"></span>
                  <span className="text-xs font-bold text-[#7e22ce]">Proposed Action Confirmation Required</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-[#7e22ce] font-mono font-bold border border-purple-200">
                  {activeProposal.actionType}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium">{activeProposal.summary}</p>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  disabled={executingAction}
                  onClick={() => void handleActionConfirm(false)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={executingAction}
                  onClick={() => void handleActionConfirm(true)}
                  className="px-3.5 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 active:scale-[0.99]"
                >
                  {executingAction ? 'Persisting...' : 'Confirm & Execute'}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {actionSuccessMessage && (
            <div className="bg-emerald-50 border-t border-emerald-200 p-3 text-[#15803d] text-xs text-center font-bold">
              ✓ {actionSuccessMessage}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border-t border-rose-200 p-3 text-rose-700 text-xs text-center font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={(e) => { void handleSendMessage(e); }} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              id="intelligence-chat-input"
              placeholder="Ask KENENISA OS Intelligence..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#3B82F6]"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* User Memory Drawer Modal */}
      {showMemoryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🧠 Personal Operating Memory</span>
              </h2>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-slate-400 hover:text-slate-800 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Durable user-confirmed operating preferences and rules stored for contextual assistance.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {memories.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2 text-center">No persistent user memories stored yet.</p>
              ) : (
                memories.map((m) => (
                  <div key={m.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#0284c7]">{m.key}:</span>{' '}
                      <span className="text-slate-800 font-medium">{m.value}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.category}</div>
                    </div>
                    <button
                      onClick={() => void handleArchiveMemory(m.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                      title="Archive memory"
                    >
                      Archive
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
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

