import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSkills, fetchSkillById, createSkill, updateSkill, archiveSkill } from '../features/learning/api.js';
import type { SkillDto, SkillDetailDto, SkillLevel } from '@kenenisa-os/shared';
import { useToast } from '../components/ui/Toast.js';

const SKILL_LEVELS: SkillLevel[] = ['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

export function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-View Mode
  const [viewMode, setViewMode] = useState<'matrix' | 'list' | 'category'>(() => {
    return (localStorage.getItem('kenenisa_skills_view') as 'matrix' | 'list' | 'category') || 'matrix';
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<SkillDto | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currentLevel, setCurrentLevel] = useState<SkillLevel>('BEGINNER');
  const [targetLevel, setTargetLevel] = useState<SkillLevel>('ADVANCED');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSkills({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setSkills(data);
      if (data.length > 0 && !selectedSkill) {
        const detail = await fetchSkillById(data[0].id);
        setSelectedSkill(detail);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, selectedSkill]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSelectSkill = async (id: string) => {
    try {
      const detail = await fetchSkillById(id);
      setSelectedSkill(detail);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load skill details', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createSkill({
        name: name.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        currentLevel,
        targetLevel,
      });
      setIsCreateOpen(false);
      setName('');
      setCategory('');
      setDescription('');
      showToast('Skill created successfully', 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create skill', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSkill) return;
    try {
      await updateSkill(editSkill.id, {
        name,
        category: category || undefined,
        description: description || undefined,
        currentLevel,
        targetLevel,
      });
      setEditSkill(null);
      showToast('Skill updated successfully', 'success');
      void loadData();
      if (selectedSkill?.id === editSkill.id) {
        void handleSelectSkill(editSkill.id);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update skill', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Archive this skill?')) return;
    try {
      await archiveSkill(id);
      if (selectedSkill?.id === id) setSelectedSkill(null);
      showToast('Skill archived', 'info');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to archive skill', 'error');
    }
  };

  const handlePromoteLevel = async (skill: SkillDto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const curIdx = SKILL_LEVELS.indexOf(skill.currentLevel);
    if (curIdx >= SKILL_LEVELS.length - 1) {
      showToast(`"${skill.name}" is already at top mastery level (EXPERT)`, 'info');
      return;
    }
    const nextLvl = SKILL_LEVELS[curIdx + 1];
    try {
      await updateSkill(skill.id, { currentLevel: nextLvl });
      showToast(`Promoted "${skill.name}" to ${nextLvl}!`, 'success');
      void loadData();
      if (selectedSkill?.id === skill.id) {
        void handleSelectSkill(skill.id);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to promote skill', 'error');
    }
  };

  const handleDemoteLevel = async (skill: SkillDto, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const curIdx = SKILL_LEVELS.indexOf(skill.currentLevel);
    if (curIdx <= 0) {
      showToast(`"${skill.name}" is already at BEGINNER level`, 'info');
      return;
    }
    const prevLvl = SKILL_LEVELS[curIdx - 1];
    try {
      await updateSkill(skill.id, { currentLevel: prevLvl });
      showToast(`Demoted "${skill.name}" to ${prevLvl}`, 'info');
      void loadData();
      if (selectedSkill?.id === skill.id) {
        void handleSelectSkill(skill.id);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update skill level', 'error');
    }
  };

  const handleSetLevelDirectly = async (skillId: string, targetLevel: SkillLevel) => {
    try {
      await updateSkill(skillId, { currentLevel: targetLevel });
      showToast(`Skill level updated to ${targetLevel}`, 'success');
      void loadData();
      if (selectedSkill?.id === skillId) {
        void handleSelectSkill(skillId);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to set skill level', 'error');
    }
  };

  const handleSetViewMode = (mode: 'matrix' | 'list' | 'category') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_skills_view', mode);
  };

  const levelColor = (lvl: SkillLevel) => {
    switch (lvl) {
      case 'BEGINNER': return 'text-slate-700 bg-slate-100 border-slate-200';
      case 'ELEMENTARY': return 'text-[#0284c7] bg-sky-50 border-sky-200';
      case 'INTERMEDIATE': return 'text-[#1d4ed8] bg-blue-50 border-blue-200';
      case 'ADVANCED': return 'text-[#7e22ce] bg-purple-50 border-purple-200';
      case 'EXPERT': return 'text-[#92400e] bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const renderLevelSteps = (current: SkillLevel, target: SkillLevel) => {
    const currentIdx = SKILL_LEVELS.indexOf(current);
    const targetIdx = SKILL_LEVELS.indexOf(target);

    return (
      <div className="flex items-center gap-1 pt-1">
        {SKILL_LEVELS.map((lvl, idx) => {
          const isReached = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const isTarget = idx === targetIdx;

          return (
            <div
              key={lvl}
              title={`${lvl}${isCurrent ? ' (Current)' : ''}${isTarget ? ' (Target)' : ''}`}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                isCurrent
                  ? 'bg-purple-600 ring-2 ring-purple-300'
                  : isReached
                  ? 'bg-blue-500'
                  : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const map = new Map<string, SkillDto[]>();
    for (const skill of skills) {
      const cat = skill.category || 'General & Core';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill);
    }
    return map;
  }, [skills]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Skill Matrix & Capabilities</h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Track explicit engineering skills, target mastery levels, and practical project application.
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setCategory('');
            setDescription('');
            setCurrentLevel('BEGINNER');
            setTargetLevel('ADVANCED');
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
        >
          + Add Skill
        </button>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#6366F1] font-medium"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#6366F1]"
          >
            <option value="ACTIVE">Active Skills</option>
            <option value="PAUSED">Paused</option>
            <option value="MASTERED">Mastered</option>
            <option value="ARCHIVED">Archived</option>
            <option value="">All Statuses</option>
          </select>
        </div>

        {/* View Switcher: Matrix Board vs List & Inspector vs Category Gallery */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => handleSetViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Matrix Board
          </button>
          <button
            onClick={() => handleSetViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📑 List & Inspector
          </button>
          <button
            onClick={() => handleSetViewMode('category')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'category'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗂️ Categories
          </button>
        </div>
      </div>

      {/* VIEW MODES */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading capability matrix...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">{error}</div>
      ) : skills.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
          <p className="text-slate-900 text-sm font-bold">No skills defined yet.</p>
          <p className="text-xs text-slate-600">Click "+ Add Skill" above to start mapping your engineering capabilities.</p>
        </div>
      ) : (
        <>
          {/* MODE 1: MATRIX BOARD (BY LEVEL) */}
          {viewMode === 'matrix' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {SKILL_LEVELS.map((level) => {
                const columnSkills = skills.filter((s) => s.currentLevel === level);

                return (
                  <div
                    key={level}
                    className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${levelColor(level)}`}>
                          {level}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {columnSkills.length}
                      </span>
                    </div>

                    {/* Column Skill Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                      {columnSkills.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-[11px] italic border border-dashed border-slate-200 rounded-xl">
                          No skills at {level}
                        </div>
                      ) : (
                        columnSkills.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => { void handleSelectSkill(s.id); }}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs hover:border-slate-300 space-y-2.5 ${
                              selectedSkill?.id === s.id ? 'ring-2 ring-purple-400 border-purple-300' : 'border-slate-200/90'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div className="min-w-0">
                                {s.category && (
                                  <span className="text-[9px] font-extrabold uppercase text-[#7e22ce] tracking-wider block truncate">
                                    {s.category}
                                  </span>
                                )}
                                <h4 className="font-bold text-slate-900 text-xs tracking-tight line-clamp-2">
                                  {s.name}
                                </h4>
                              </div>
                            </div>

                            {/* 5-Step Visual Progression */}
                            {renderLevelSteps(s.currentLevel, s.targetLevel)}

                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1">
                              <span>Target: <strong className="text-slate-800">{s.targetLevel}</strong></span>
                              <span>{s._count?.learningItems ?? 0} items</span>
                            </div>

                            {/* 1-Click Level Advancement Actions */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => void handleDemoteLevel(s, e)}
                                  disabled={s.currentLevel === 'BEGINNER'}
                                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  title="Demote Level"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={(e) => void handlePromoteLevel(s, e)}
                                  disabled={s.currentLevel === 'EXPERT'}
                                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-50 hover:bg-purple-100 text-[#7e22ce] border border-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  title="Promote Level"
                                >
                                  ▲ Promote
                                </button>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleSelectSkill(s.id);
                                  handleSetViewMode('list');
                                }}
                                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                              >
                                Inspect →
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: MASTER LIST & DETAIL INSPECTOR */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Skill List */}
              <div className="lg:col-span-1 space-y-3">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => { void handleSelectSkill(skill.id); }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedSkill?.id === skill.id
                        ? 'bg-purple-50/70 border-purple-300 shadow-xs ring-1 ring-purple-300'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        {skill.category && (
                          <span className="text-[10px] font-extrabold uppercase text-[#7e22ce] tracking-wider block truncate">
                            {skill.category}
                          </span>
                        )}
                        <h3 className="font-bold text-slate-900 text-sm truncate">{skill.name}</h3>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border shrink-0 ${levelColor(skill.currentLevel)}`}>
                        {skill.currentLevel}
                      </span>
                    </div>

                    {renderLevelSteps(skill.currentLevel, skill.targetLevel)}

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>Target: {skill.targetLevel}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => void handleDemoteLevel(skill, e)}
                          disabled={skill.currentLevel === 'BEGINNER'}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded disabled:opacity-30 cursor-pointer"
                        >
                          ▼
                        </button>
                        <button
                          onClick={(e) => void handlePromoteLevel(skill, e)}
                          disabled={skill.currentLevel === 'EXPERT'}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-[#7e22ce] border border-purple-200 rounded disabled:opacity-30 cursor-pointer"
                        >
                          ▲
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Skill Detail Panel */}
              <div className="lg:col-span-2">
                {selectedSkill ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0">
                        {selectedSkill.category && (
                          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#7e22ce] tracking-wider">
                            {selectedSkill.category}
                          </span>
                        )}
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{selectedSkill.name}</h2>
                        {selectedSkill.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{selectedSkill.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditSkill(selectedSkill);
                            setName(selectedSkill.name);
                            setCategory(selectedSkill.category || '');
                            setDescription(selectedSkill.description || '');
                            setCurrentLevel(selectedSkill.currentLevel);
                            setTargetLevel(selectedSkill.targetLevel);
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { void handleArchive(selectedSkill.id); }}
                          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    </div>

                    {/* Interactive Level Advancement Bar */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Mastery Level</span>
                        <span className="text-xs font-medium text-slate-500">Target: <strong className="text-slate-900">{selectedSkill.targetLevel}</strong></span>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {SKILL_LEVELS.map((lvl) => {
                          const isCurrent = selectedSkill.currentLevel === lvl;
                          return (
                            <button
                              key={lvl}
                              onClick={() => void handleSetLevelDirectly(selectedSkill.id, lvl)}
                              className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs ring-2 ring-purple-200'
                                  : 'bg-white hover:bg-purple-50 text-slate-700 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>

                      {renderLevelSteps(selectedSkill.currentLevel, selectedSkill.targetLevel)}
                    </div>

                    {/* Linked Learning Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-slate-900">Linked Learning Items</h3>
                        <span className="text-xs font-semibold text-slate-500">{selectedSkill.learningItems.length} items</span>
                      </div>
                      {selectedSkill.learningItems.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
                          No learning items linked to this skill yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {selectedSkill.learningItems.map((li) => (
                            <div
                              key={li.id}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center"
                            >
                              <div>
                                <p className="text-xs font-bold text-slate-900">{li.title}</p>
                                <p className="text-[11px] text-slate-600 font-medium">
                                  Type: {li.type} • Logged: {li.totalLoggedMinutes ?? 0}m
                                </p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold">
                                {li.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Applied Projects */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Applied in Projects</h3>
                      {selectedSkill.appliedProjects.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
                          Not directly applied to any active project yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedSkill.appliedProjects.map((p) => (
                            <span
                              key={p.id}
                              className="px-3 py-1 bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold rounded-lg"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-500 text-xs font-medium shadow-xs">
                    Select a skill from the list to view capability details.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE 3: CATEGORY GALLERY */}
          {viewMode === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from(skillsByCategory.entries()).map(([cat, catSkills]) => (
                <div key={cat} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat}</h3>
                      <p className="text-[11px] text-slate-500">{catSkills.length} capability skills</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-purple-50 text-[#7e22ce] border border-purple-200 rounded-lg">
                      {catSkills.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {catSkills.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          void handleSelectSkill(s.id);
                          handleSetViewMode('list');
                        }}
                        className="p-3 bg-slate-50/80 hover:bg-purple-50/30 rounded-xl border border-slate-200/90 transition-all cursor-pointer flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                          <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-bold border mt-1 ${levelColor(s.currentLevel)}`}>
                            {s.currentLevel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => void handlePromoteLevel(s, e)}
                            disabled={s.currentLevel === 'EXPERT'}
                            className="px-2 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-[#7e22ce] border border-purple-200 rounded disabled:opacity-30 cursor-pointer"
                          >
                            ▲
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Create Skill */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Add New Skill</h2>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. System Architecture & High Availability"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Backend / Infrastructure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs text-center"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Skill */}
      {editSkill && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Edit Skill</h2>

            <form onSubmit={(e) => { void handleEditSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditSkill(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Update Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
