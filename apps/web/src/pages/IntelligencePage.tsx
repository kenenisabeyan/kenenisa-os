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
    <div id="intelligence-page" className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>KENENISA OS Intelligence Core</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium">
              Contextual AI Reasoning
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Factual reasoning assistant grounded strictly in your personal operating system context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleOpenMemories()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            🧠 Operating Memory
          </button>
          <button
            onClick={handleNewConversation}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            + New Conversation
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden">
        {/* Sidebar: Conversation History */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Conversations
          </h3>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 p-2 italic">No conversations yet.</p>
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
                      ? 'bg-slate-800 border border-slate-700 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{c.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDeleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-1"
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
        <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Context Transparency Banner */}
          {contextSummary && (
            <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="font-semibold text-slate-300">Context Active:</span>
                <span>
                  {contextSummary.activeProjectsCount} Projects · {contextSummary.todayTasksCount} Tasks · Capacity {contextSummary.capacityMinutes}m
                </span>
              </div>
              {contextSummary.nextBestActionTitle && (
                <span className="text-cyan-400 font-medium truncate max-w-xs">
                  Next Best Action: {contextSummary.nextBestActionTitle}
                </span>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-2xl font-bold">
                  🧠
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Ask KENENISA OS Intelligence</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Ask about your Next Best Action, daily capacity, blocked work, active projects, or pursuing career opportunities.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs max-w-lg w-full pt-2">
                  <button
                    onClick={() => setInputText('What should I work on next today?')}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-slate-300 hover:text-white transition-all"
                  >
                    🎯 What should I focus on next today?
                  </button>
                  <button
                    onClick={() => setInputText('Am I overloading my available capacity?')}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-slate-300 hover:text-white transition-all"
                  >
                    ⚡ Am I overloading my available capacity?
                  </button>
                  <button
                    onClick={() => setInputText('What opportunities am I currently pursuing?')}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-slate-300 hover:text-white transition-all"
                  >
                    💼 What opportunities am I pursuing?
                  </button>
                  <button
                    onClick={() => setInputText('Create a task called Finish API Docs')}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-slate-300 hover:text-white transition-all"
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
                    className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                      m.role === 'USER'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="font-bold text-[10px] opacity-70 uppercase tracking-wider">
                      {m.role === 'USER' ? 'You' : 'KENENISA OS Intelligence'}
                    </div>
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Metadata: Facts, Inferences, Recommendations */}
                    {m.metadata && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                        {Array.isArray(m.metadata.facts) && m.metadata.facts.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-emerald-400">Facts:</span>
                            <ul className="list-disc list-inside text-slate-400">
                              {m.metadata.facts.map((f: unknown, idx: number) => (
                                <li key={idx}>{String(f)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {Array.isArray(m.metadata.recommendations) && m.metadata.recommendations.length > 0 && (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-cyan-400">Recommendation:</span>
                            <ul className="list-disc list-inside text-slate-300">
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
            <div className="bg-cyan-950/40 border-t border-cyan-800/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span className="text-xs font-bold text-cyan-200">Proposed Action Confirmation Required</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono">
                  {activeProposal.actionType}
                </span>
              </div>
              <p className="text-xs text-slate-300">{activeProposal.summary}</p>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  disabled={executingAction}
                  onClick={() => void handleActionConfirm(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={executingAction}
                  onClick={() => void handleActionConfirm(true)}
                  className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  {executingAction ? 'Persisting...' : 'Confirm & Execute'}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {actionSuccessMessage && (
            <div className="bg-emerald-950/40 border-t border-emerald-800/50 p-3 text-emerald-300 text-xs text-center font-medium">
              ✓ {actionSuccessMessage}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/40 border-t border-red-800/50 p-3 text-red-300 text-xs text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={(e) => { void handleSendMessage(e); }} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              id="intelligence-chat-input"
              placeholder="Ask KENENISA OS Intelligence..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🧠 Personal Operating Memory</span>
              </h2>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Durable user-confirmed operating preferences and rules stored for contextual assistance.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {memories.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-2 text-center">No persistent user memories stored yet.</p>
              ) : (
                memories.map((m) => (
                  <div key={m.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-cyan-400">{m.key}:</span>{' '}
                      <span className="text-slate-300">{m.value}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.category}</div>
                    </div>
                    <button
                      onClick={() => void handleArchiveMemory(m.id)}
                      className="text-slate-400 hover:text-red-400 text-xs"
                      title="Archive memory"
                    >
                      Archive
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowMemoryModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl"
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
