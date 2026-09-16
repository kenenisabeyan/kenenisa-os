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
      case 'BEGINNER': return 'text-slate-400 bg-slate-800 border-slate-700';
      case 'ELEMENTARY': return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'INTERMEDIATE': return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'ADVANCED': return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'EXPERT': return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Skill Matrix & Capabilities</h1>
          <p className="text-sm text-slate-400">
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
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          + Add Skill
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500 min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
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
            <div className="p-4 text-center text-slate-400">Loading skills...</div>
          ) : error ? (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl">{error}</div>
          ) : skills.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/30 border border-slate-800 rounded-xl">
              <p className="text-slate-300 text-sm font-medium">No skills defined.</p>
              <p className="text-xs text-slate-500 mt-1">Add explicit skills to track capability growth.</p>
            </div>
          ) : (
            skills.map((skill) => (
              <div
                key={skill.id}
                onClick={() => { void handleSelectSkill(skill.id); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedSkill?.id === skill.id
                    ? 'bg-purple-950/30 border-purple-600 shadow-md'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {skill.category && (
                      <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-wider">
                        {skill.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-slate-100 text-sm">{skill.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${levelColor(skill.currentLevel)}`}>
                    {skill.currentLevel}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
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
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  {selectedSkill.category && (
                    <span className="text-xs font-semibold uppercase text-purple-400 tracking-wider">
                      {selectedSkill.category}
                    </span>
                  )}
                  <h2 className="text-xl font-bold text-slate-100">{selectedSkill.name}</h2>
                  {selectedSkill.description && (
                    <p className="text-sm text-slate-400 mt-1">{selectedSkill.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditSkill(selectedSkill);
                      setName(selectedSkill.name);
                      setCategory(selectedSkill.category || '');
                      setDescription(selectedSkill.description || '');
                      setCurrentLevel(selectedSkill.currentLevel);
                      setTargetLevel(selectedSkill.targetLevel);
                    }}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { void handleArchive(selectedSkill.id); }}
                    className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium rounded-lg"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {/* Levels Row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Current Level</p>
                  <p className="text-base font-bold text-purple-400 mt-1">{selectedSkill.currentLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Target Level</p>
                  <p className="text-base font-bold text-slate-200 mt-1">{selectedSkill.targetLevel}</p>
                </div>
              </div>

              {/* Linked Learning Items */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Linked Learning Items</h3>
                {selectedSkill.learningItems.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No learning items linked to this skill yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSkill.learningItems.map((li) => (
                      <div
                        key={li.id}
                        className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{li.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Type: {li.type} • Logged: {li.totalLoggedMinutes ?? 0}m
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {li.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applied Projects */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Applied in Projects</h3>
                {selectedSkill.appliedProjects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Not directly applied to any active project yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.appliedProjects.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1 bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs rounded-lg"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/20 border border-slate-800 rounded-xl text-slate-500">
              Select a skill from the list to view capability details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Skill */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add New Skill</h2>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. System Architecture & High Availability"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Backend / Infrastructure"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Edit Skill</h2>

            <form onSubmit={(e) => { void handleEditSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current Level</label>
                  <select
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Level</label>
                  <select
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(e.target.value as SkillLevel)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="ELEMENTARY">Elementary</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditSkill(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm rounded-lg"
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
