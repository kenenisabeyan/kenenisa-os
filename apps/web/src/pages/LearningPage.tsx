import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchLearningItems,
  fetchLearningMetrics,
  fetchSkills,
  createLearningItem,
  recordLearningActivity,
  linkLearningSkill,
  startLearningItem,
  pauseLearningItem,
  completeLearningItem,
  reopenLearningItem,
} from '../features/learning/api.js';
import type {
  LearningItemDto,
  LearningMetricsDto,
  SkillDto,
  LearningItemType,
} from '@kenenisa-os/shared';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';

interface LearningColumn {
  status: string;
  label: string;
  dotColor: string;
}

const LEARNING_COLUMNS: LearningColumn[] = [
  {
    status: 'NOT_STARTED',
    label: 'To Study',
    dotColor: 'bg-slate-400',
  },
  {
    status: 'IN_PROGRESS',
    label: 'Currently Learning',
    dotColor: 'bg-blue-600',
  },
  {
    status: 'PAUSED',
    label: 'On Hold',
    dotColor: 'bg-amber-500',
  },
  {
    status: 'COMPLETED',
    label: 'Mastered',
    dotColor: 'bg-emerald-600',
  },
];

export function LearningPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<LearningItemDto[]>([]);
  const [metrics, setMetrics] = useState<LearningMetricsDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Study Board vs Grid Gallery
  const [viewMode, setViewMode] = useState<'board' | 'grid'>(() => {
    return (localStorage.getItem('kenenisa_learning_view_mode') as 'board' | 'grid') || 'board';
  });

  const handleSetViewMode = (mode: 'board' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_learning_view_mode', mode);
  };

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeActivityItem, setActiveActivityItem] = useState<LearningItemDto | null>(null);
  const [activeSkillLinkItem, setActiveSkillLinkItem] = useState<LearningItemDto | null>(null);

  // Form states
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createType, setCreateType] = useState<LearningItemType>('COURSE');
  const [createSource, setCreateSource] = useState('');
  const [createUrl, setCreateUrl] = useState('');
  const [createEstMinutes, setCreateEstMinutes] = useState(120);
  const [createTargetDate, setCreateTargetDate] = useState('');
  const [createInitialStatus, setCreateInitialStatus] = useState<string>('NOT_STARTED');

  const [activityMinutes, setActivityMinutes] = useState(60);
  const [activityNotes, setActivityNotes] = useState('');

  const [selectedSkillId, setSelectedSkillId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, metricsData, skillsData] = await Promise.all([
        fetchLearningItems({
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          search: searchQuery || undefined,
        }),
        fetchLearningMetrics(),
        fetchSkills(),
      ]);
      setItems(itemsData);
      setMetrics(metricsData);
      setSkills(skillsData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load learning data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    try {
      const created = await createLearningItem({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        type: createType,
        source: createSource.trim() || undefined,
        url: createUrl.trim() || undefined,
        estimatedMinutes: Number(createEstMinutes) || 0,
        targetDate: createTargetDate || undefined,
      });

      if (createInitialStatus === 'IN_PROGRESS' && created?.id) {
        await startLearningItem(created.id);
      }

      setIsCreateOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateSource('');
      setCreateUrl('');
      setCreateInitialStatus('NOT_STARTED');
      showToast('Learning item created successfully', 'success');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create learning item';
      showToast(msg, 'error');
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActivityItem || activityMinutes <= 0) return;
    try {
      await recordLearningActivity(activeActivityItem.id, {
        minutes: Number(activityMinutes),
        notes: activityNotes.trim() || undefined,
      });
      setActiveActivityItem(null);
      setActivityMinutes(60);
      setActivityNotes('');
      showToast(`Logged ${activityMinutes}m on "${activeActivityItem.title}"`, 'success');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to log learning activity';
      showToast(msg, 'error');
    }
  };

  const handleLinkSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkillLinkItem || !selectedSkillId) return;
    try {
      await linkLearningSkill(activeSkillLinkItem.id, { skillId: selectedSkillId });
      setActiveSkillLinkItem(null);
      setSelectedSkillId('');
      showToast('Skill attached to learning item', 'success');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link skill';
      showToast(msg, 'error');
    }
  };

  const handleStatusTransition = async (item: LearningItemDto, action: 'start' | 'pause' | 'complete' | 'reopen') => {
    try {
      if (action === 'start') {
        await startLearningItem(item.id);
        showToast(`Started studying "${item.title}"`, 'info');
      } else if (action === 'pause') {
        await pauseLearningItem(item.id);
        showToast(`Paused "${item.title}"`, 'info');
      } else if (action === 'complete') {
        await completeLearningItem(item.id);
        showToast(`Completed & Mastered "${item.title}"!`, 'success');
      } else if (action === 'reopen') {
        await reopenLearningItem(item.id);
        showToast(`Reopened "${item.title}"`, 'info');
      }
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to transition learning status';
      showToast(msg, 'error');
    }
  };

  // Group items by status for Study Board
  const itemsByStatus = useMemo(() => {
    const map: Record<string, LearningItemDto[]> = {
      NOT_STARTED: [],
      IN_PROGRESS: [],
      PAUSED: [],
      COMPLETED: [],
    };
    items.forEach((item) => {
      if (map[item.status]) {
        map[item.status].push(item);
      } else {
        map.NOT_STARTED.push(item);
      }
    });
    return map;
  }, [items]);

  const openCreateForStatus = (st: string) => {
    setCreateInitialStatus(st);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
            Learning & Knowledge Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Notion-style study board connecting reading, courses & research to explicit skills and projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => handleSetViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white text-cyan-700 shadow-2xs border border-cyan-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Switch to Notion Study Board"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>Study Board</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-cyan-700 shadow-2xs border border-cyan-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Switch to Grid Gallery"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Grid Gallery</span>
            </button>
          </div>

          <button
            onClick={() => {
              setCreateInitialStatus('NOT_STARTED');
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Learning Item</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Learning Items</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{metrics.totalItems}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-sky-600 mt-1">{metrics.inProgressItems}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{metrics.completedItems}</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Logged Time</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{Math.round(metrics.totalLoggedMinutes / 60)}h</p>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs col-span-2 sm:col-span-1">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Active Skills</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">{metrics.activeSkillsCount}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search learning items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl pl-9 pr-3.5 py-2 focus:outline-none focus:border-cyan-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            <option value="COURSE">Course</option>
            <option value="BOOK">Book</option>
            <option value="TUTORIAL">Tutorial</option>
            <option value="DOCUMENTATION">Documentation</option>
            <option value="LECTURE">Lecture</option>
            <option value="PROJECT">Project</option>
            <option value="PRACTICE">Practice</option>
            <option value="ARTICLE">Article</option>
          </select>

          {(searchQuery || statusFilter || typeFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading learning items...</div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto text-xl font-bold">
            📚
          </div>
          <p className="text-slate-800 font-bold text-sm">No learning items found.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Define intentional learning items to track courses, textbooks, and documentation.
          </p>
          <button
            onClick={() => {
              setCreateInitialStatus('NOT_STARTED');
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Create First Item
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE STUDY BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start overflow-x-auto pb-6">
          {LEARNING_COLUMNS.map((col) => {
            const colItems = itemsByStatus[col.status] || [];
            const totalEstMin = colItems.reduce((acc, i) => acc + (i.estimatedMinutes || 0), 0);
            const totalLoggedMin = colItems.reduce((acc, i) => acc + (i.totalLoggedMinutes || 0), 0);

            return (
              <div
                key={col.status}
                className="bg-slate-50/70 border border-slate-200/90 rounded-2xl flex flex-col max-h-[82vh] shadow-2xs"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/80 rounded-t-2xl flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor} shrink-0`} />
                    <h3 className="font-extrabold text-xs text-slate-900 tracking-tight truncate">
                      {col.label}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200/80 shrink-0">
                      {colItems.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateForStatus(col.status)}
                    className="p-1 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                    title={`Add to ${col.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Logged: {Math.round(totalLoggedMin / 60)}h</span>
                  <span>Est: {Math.round(totalEstMin / 60)}h</span>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colItems.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No items in {col.label.toLowerCase()}</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.status)}
                        className="mt-2 text-[11px] font-bold text-cyan-600 hover:text-cyan-700 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-cyan-300 transition-all space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200 truncate">
                            {item.type}
                          </span>

                          <span className="text-[10px] font-bold font-mono text-slate-500">
                            {item.progressPercent}%
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Mini progress bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }}
                          />
                        </div>

                        {/* Meta & Skills */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span>Logged: <strong className="text-slate-800">{item.totalLoggedMinutes ?? 0}m</strong></span>
                            {item.source && <span className="truncate max-w-[100px] text-slate-400">{item.source}</span>}
                          </div>

                          {item.skills && item.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.skills.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-1.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 text-[9px] rounded font-bold"
                                >
                                  {s.skill?.name ?? 'Skill'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setActiveActivityItem(item)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
                              title="Log Study Time"
                            >
                              + Log
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveSkillLinkItem(item)}
                              className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded cursor-pointer"
                              title="Attach Skill"
                            >
                              + Skill
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {item.status === 'NOT_STARTED' && (
                              <button
                                type="button"
                                onClick={() => void handleStatusTransition(item, 'start')}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded cursor-pointer"
                              >
                                Start
                              </button>
                            )}
                            {item.status === 'IN_PROGRESS' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleStatusTransition(item, 'pause')}
                                  className="px-1.5 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold rounded cursor-pointer"
                                >
                                  Pause
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleStatusTransition(item, 'complete')}
                                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded cursor-pointer"
                                >
                                  ✓ Done
                                </button>
                              </>
                            )}
                            {item.status === 'COMPLETED' && (
                              <button
                                type="button"
                                onClick={() => void handleStatusTransition(item, 'reopen')}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded cursor-pointer"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           GRID GALLERY VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 hover:border-cyan-200 hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-extrabold tracking-wider rounded uppercase mb-1.5">
                      {item.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : item.status === 'PAUSED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{item.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Progress</span>
                    <span className="font-bold">{item.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-cyan-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }}
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Logged: <strong className="text-slate-800">{item.totalLoggedMinutes ?? 0}m</strong></span>
                  {item.estimatedMinutes > 0 && <span>Est: {item.estimatedMinutes}m</span>}
                  {item.project && (
                    <span className="text-blue-600 font-bold">Applied: {item.project.name}</span>
                  )}
                </div>

                {/* Linked Skills Badges */}
                {item.skills && item.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] rounded font-bold"
                      >
                        {s.skill?.name ?? 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-4">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveActivityItem(item)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded transition-colors cursor-pointer"
                  >
                    + Log Time
                  </button>
                  <button
                    onClick={() => setActiveSkillLinkItem(item)}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded transition-colors border border-purple-200 cursor-pointer"
                  >
                    + Skill
                  </button>
                </div>

                <div className="flex gap-1">
                  {item.status === 'NOT_STARTED' && (
                    <button
                      onClick={() => { void handleStatusTransition(item, 'start'); }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded cursor-pointer"
                    >
                      Start
                    </button>
                  )}
                  {item.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => { void handleStatusTransition(item, 'pause'); }}
                        className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-bold rounded cursor-pointer"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => { void handleStatusTransition(item, 'complete'); }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded cursor-pointer"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {item.status === 'COMPLETED' && (
                    <button
                      onClick={() => { void handleStatusTransition(item, 'reopen'); }}
                      className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded cursor-pointer"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Learning Item */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Add Learning Item</h2>
                {createInitialStatus && (
                  <p className="text-[11px] text-slate-500">
                    Status: <strong className="text-cyan-600">{createInitialStatus}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Consensus Protocols"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as LearningItemType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="COURSE">Course</option>
                  <option value="BOOK">Book</option>
                  <option value="TUTORIAL">Tutorial</option>
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="LECTURE">Lecture</option>
                  <option value="PROJECT">Project</option>
                  <option value="PRACTICE">Practice</option>
                  <option value="ARTICLE">Article</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Source / Provider</label>
                  <input
                    type="text"
                    value={createSource}
                    onChange={(e) => setCreateSource(e.target.value)}
                    placeholder="e.g. MIT OCW"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    value={createEstMinutes}
                    onChange={(e) => setCreateEstMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={createTargetDate}
                    onChange={(e) => setCreateTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource URL</label>
                <input
                  type="url"
                  value={createUrl}
                  onChange={(e) => setCreateUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Activity (Log Time) */}
      {activeActivityItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Log Activity on: <span className="text-cyan-600">{activeActivityItem.title}</span>
            </h2>
            <form onSubmit={(e) => { void handleActivitySubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minutes Spent</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  required
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-2 mt-2">
                  {[30, 45, 60, 90, 120].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setActivityMinutes(m)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 rounded-lg cursor-pointer"
                    >
                      +{m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Notes (Optional)</label>
                <textarea
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="Key concepts grasped, algorithmic discoveries, references..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveActivityItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Skill */}
      {activeSkillLinkItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Attach Skill to: <span className="text-purple-600">{activeSkillLinkItem.title}</span>
            </h2>
            <form onSubmit={(e) => { void handleLinkSkillSubmit(e); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Skill</label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select a skill to connect...</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSkillLinkItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSkillId}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Attach Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Central AI Copilot */}
      <PageAiCopilot pageType="learning" />
    </div>
  );
}
