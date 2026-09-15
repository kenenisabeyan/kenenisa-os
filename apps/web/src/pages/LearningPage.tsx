import { useState, useEffect, useCallback } from 'react';
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

export function LearningPage() {
  const [items, setItems] = useState<LearningItemDto[]>([]);
  const [metrics, setMetrics] = useState<LearningMetricsDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      await createLearningItem({
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        type: createType,
        source: createSource.trim() || undefined,
        url: createUrl.trim() || undefined,
        estimatedMinutes: Number(createEstMinutes) || 0,
        targetDate: createTargetDate || undefined,
      });
      setIsCreateOpen(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateSource('');
      setCreateUrl('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create learning item');
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
      setActivityNotes('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record activity');
    }
  };

  const handleLinkSkillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSkillLinkItem || !selectedSkillId) return;
    try {
      await linkLearningSkill(activeSkillLinkItem.id, {
        skillId: selectedSkillId,
      });
      setActiveSkillLinkItem(null);
      setSelectedSkillId('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to link skill');
    }
  };

  const handleStatusTransition = async (item: LearningItemDto, action: 'start' | 'pause' | 'complete' | 'reopen') => {
    try {
      if (action === 'start') await startLearningItem(item.id);
      if (action === 'pause') await pauseLearningItem(item.id);
      if (action === 'complete') await completeLearningItem(item.id);
      if (action === 'reopen') await reopenLearningItem(item.id);
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to ${action} item`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Learning & Capability Intelligence</h1>
          <p className="text-sm text-slate-400">
            Connect structured learning activities to explicit skills and project evidence.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          + New Learning Item
        </button>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">Learning Items</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{metrics.totalItems}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.inProgressItems}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.completedItems}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <p className="text-xs font-medium text-slate-400">Logged Time</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{Math.round(metrics.totalLoggedMinutes / 60)}h</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 col-span-2 md:col-span-1">
            <p className="text-xs font-medium text-slate-400">Active Skills</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{metrics.activeSkillsCount}</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search learning items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
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
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Types</option>
          <option value="COURSE">Course</option>
          <option value="BOOK">Book</option>
          <option value="TUTORIAL">Tutorial</option>
          <option value="DOCUMENTATION">Documentation</option>
          <option value="LECTURE">Lecture</option>
          <option value="PROJECT">Project</option>
          <option value="PRACTICE">Practice</option>
        </select>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading learning items...</div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-xl">
          <p className="text-slate-300 font-medium">No learning items found.</p>
          <p className="text-xs text-slate-500 mt-1">
            Define intentional learning items to track your technical progression.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-4 hover:border-slate-600 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-semibold tracking-wider rounded uppercase mb-1.5">
                      {item.type}
                    </span>
                    <h3 className="font-semibold text-slate-100 text-base">{item.title}</h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800'
                        : item.status === 'IN_PROGRESS'
                        ? 'bg-cyan-950/50 text-cyan-300 border-cyan-800'
                        : item.status === 'PAUSED'
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress</span>
                    <span>{item.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }}
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span>Logged: <strong>{item.totalLoggedMinutes ?? 0}m</strong></span>
                  {item.estimatedMinutes > 0 && <span>Est: {item.estimatedMinutes}m</span>}
                  {item.project && (
                    <span className="text-cyan-400">Applied: {item.project.name}</span>
                  )}
                </div>

                {/* Linked Skills Badges */}
                {item.skills && item.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] rounded"
                      >
                        {s.skill?.name ?? 'Skill'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2 mt-4">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setActiveActivityItem(item)}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded transition-colors"
                  >
                    + Log Time
                  </button>
                  <button
                    onClick={() => setActiveSkillLinkItem(item)}
                    className="px-2.5 py-1 bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 text-xs font-medium rounded transition-colors border border-purple-700/40"
                  >
                    + Skill
                  </button>
                </div>

                <div className="flex gap-1">
                  {item.status === 'NOT_STARTED' && (
                    <button
                      onClick={() => { void handleStatusTransition(item, 'start'); }}
                      className="px-2.5 py-1 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium rounded"
                    >
                      Start
                    </button>
                  )}
                  {item.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => { void handleStatusTransition(item, 'pause'); }}
                        className="px-2 py-1 bg-amber-900/60 text-amber-200 hover:bg-amber-800 text-xs font-medium rounded"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => { void handleStatusTransition(item, 'complete'); }}
                        className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded"
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {item.status === 'COMPLETED' && (
                    <button
                      onClick={() => { void handleStatusTransition(item, 'reopen'); }}
                      className="px-2 py-1 bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium rounded"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add Learning Item</h2>
            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Consensus Protocols"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value as LearningItemType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Source / Provider</label>
                  <input
                    type="text"
                    value={createSource}
                    onChange={(e) => setCreateSource(e.target.value)}
                    placeholder="e.g. MIT OCW"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    value={createEstMinutes}
                    onChange={(e) => setCreateEstMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={createTargetDate}
                    onChange={(e) => setCreateTargetDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-lg"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Activity */}
      {activeActivityItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Log Learning Session</h2>
            <p className="text-xs text-slate-400">Record time spent studying {activeActivityItem.title}</p>

            <form onSubmit={(e) => { void handleActivitySubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Minutes Spent</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Key Learnings</label>
                <textarea
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="What concepts were covered today?"
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveActivityItem(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-lg"
                >
                  Record Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Skill */}
      {activeSkillLinkItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Link Skill</h2>
            <p className="text-xs text-slate-400">Connect a skill developed by {activeSkillLinkItem.title}</p>

            <form onSubmit={(e) => { void handleLinkSkillSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Skill</label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose a skill...</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.currentLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSkillLinkItem(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg"
                >
                  Link Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
