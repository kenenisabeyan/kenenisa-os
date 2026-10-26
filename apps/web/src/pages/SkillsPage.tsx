import { useState, useEffect, useCallback } from 'react';
import { fetchSkills, fetchSkillById, createSkill, updateSkill, archiveSkill } from '../features/learning/api.js';
import type { SkillDto, SkillDetailDto, SkillLevel } from '@kenenisa-os/shared';
import { useToast } from '../components/ui/Toast.js';

export function SkillsPage() {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#6366F1] font-medium"
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

      {/* Main Grid: Skills Sidebar + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skill List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="p-4 text-center text-slate-500 text-xs font-medium">Loading skills...</div>
          ) : error ? (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">{error}</div>
          ) : skills.length === 0 ? (
            <div className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-slate-900 text-sm font-bold">No skills defined.</p>
              <p className="text-xs text-slate-600 mt-1">Add explicit skills to track capability growth.</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => { void handleSelectSkill(skill.id); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedSkill?.id === skill.id
                    ? 'bg-purple-50/70 border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {skill.category && (
                      <span className="text-[10px] font-extrabold uppercase text-[#7e22ce] tracking-wider">
                        {skill.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm">{skill.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${levelColor(skill.currentLevel)}`}>
                    {skill.currentLevel}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Target: {skill.targetLevel}</span>
                  <span>Items: {skill._count?.learningItems ?? 0}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Skill Detail Panel */}
        <div className="lg:col-span-2">
          {selectedSkill ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
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
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { void handleArchive(selectedSkill.id); }}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {/* Levels Row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Level</p>
                  <p className="text-base font-bold text-[#7e22ce] mt-1">{selectedSkill.currentLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Target Level</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{selectedSkill.targetLevel}</p>
                </div>
              </div>

              {/* Linked Learning Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Linked Learning Items</h3>
                {selectedSkill.learningItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No learning items linked to this skill yet.</p>
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
                  <p className="text-xs text-slate-500 italic">
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
