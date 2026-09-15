import { useState, useEffect, useCallback } from 'react';
import {
  fetchEvidenceList,
  createEvidence,
  deleteEvidence,
  linkEvidenceTask,
  linkEvidenceProject,
  linkEvidenceLearningItem,
  linkEvidenceSkill,
} from '../features/evidence/api.js';
import type { EvidenceDto, EvidenceType } from '@kenenisa-os/shared';

export function EvidencePage() {
  const [items, setItems] = useState<EvidenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<EvidenceDto | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EvidenceType>('PROJECT');
  const [url, setUrl] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Link state
  const [linkType, setLinkType] = useState<'task' | 'project' | 'learning' | 'skill'>('task');
  const [entityIdInput, setEntityIdInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvidenceList({
        type: (typeFilter as EvidenceType) || undefined,
        search: searchQuery || undefined,
      });
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load evidence items');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createEvidence({
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        url: url.trim() || undefined,
        externalReference: externalReference.trim() || undefined,
        date: date || undefined,
      });
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setUrl('');
      setExternalReference('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create evidence');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence record?')) return;
    try {
      await deleteEvidence(id);
      if (activeItem?.id === id) setActiveItem(null);
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete evidence');
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !entityIdInput.trim()) return;
    try {
      let updated: EvidenceDto;
      if (linkType === 'task') updated = await linkEvidenceTask(activeItem.id, entityIdInput.trim());
      else if (linkType === 'project') updated = await linkEvidenceProject(activeItem.id, entityIdInput.trim());
      else if (linkType === 'learning') updated = await linkEvidenceLearningItem(activeItem.id, entityIdInput.trim());
      else updated = await linkEvidenceSkill(activeItem.id, entityIdInput.trim());

      setActiveItem(updated);
      setEntityIdInput('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to link relationship');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Evidence Vault & Output History</h1>
          <p className="text-sm text-slate-400">
            Observable proof of work, technical artifacts, commits, deployments, and publications.
          </p>
        </div>
        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setUrl('');
            setExternalReference('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
        >
          + Add Evidence
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <input
          type="text"
          placeholder="Search evidence records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 min-w-[220px]"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Evidence Types</option>
          <option value="PROJECT">Project</option>
          <option value="GITHUB_REPOSITORY">GitHub Repository</option>
          <option value="GIT_COMMIT">Git Commit</option>
          <option value="DEPLOYMENT">Deployment</option>
          <option value="DOCUMENT">Document</option>
          <option value="SCREENSHOT">Screenshot</option>
          <option value="VIDEO">Video</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="ARTICLE">Article</option>
        </select>
      </div>

      {/* Main Grid: Evidence Cards + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline Cards */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading evidence records...</div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-800 text-red-300 rounded-xl text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-xl">
              <p className="text-slate-300 font-medium">No evidence records captured yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Attach tangible proof (commits, deployments, docs) to tasks and projects.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`bg-slate-800/40 border p-5 rounded-xl transition-all cursor-pointer ${
                    activeItem?.id === item.id
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-semibold uppercase tracking-wider rounded mb-1.5">
                        {item.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-semibold text-slate-100 text-base">{item.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.description}</p>
                  )}

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block text-xs text-cyan-400 hover:underline mt-2.5 font-medium truncate max-w-full"
                    >
                      🔗 {item.url}
                    </a>
                  )}

                  {/* Relationship Badges */}
                  <div className="mt-3.5 pt-3 border-t border-slate-700/40 flex flex-wrap gap-2 text-[11px]">
                    {item.projects?.map((p) => (
                      <span key={p.id} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                        Project: {p.project?.name ?? p.projectId}
                      </span>
                    ))}
                    {item.tasks?.map((t) => (
                      <span key={t.id} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                        Task: {t.task?.title ?? t.taskId}
                      </span>
                    ))}
                    {item.learningItems?.map((l) => (
                      <span key={l.id} className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800 text-cyan-300 rounded">
                        Learning: {l.learningItem?.title ?? l.learningItemId}
                      </span>
                    ))}
                    {item.skills?.map((s) => (
                      <span key={s.id} className="px-2 py-0.5 bg-purple-950/60 border border-purple-800 text-purple-300 rounded">
                        Skill: {s.skill?.name ?? s.skillId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Evidence Detail & Linker */}
        <div className="lg:col-span-1">
          {activeItem ? (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-5 sticky top-6">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {activeItem.type.replace('_', ' ')}
                  </span>
                  <h2 className="text-lg font-bold text-slate-100">{activeItem.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Date: {activeItem.date}</p>
                </div>
                <button
                  onClick={() => { void handleDelete(activeItem.id); }}
                  className="px-2.5 py-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-medium rounded-lg"
                >
                  Delete
                </button>
              </div>

              {activeItem.description && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Description</p>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    {activeItem.description}
                  </p>
                </div>
              )}

              {activeItem.url && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">URL / Reference</p>
                  <a
                    href={activeItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:underline break-all font-mono"
                  >
                    {activeItem.url}
                  </a>
                </div>
              )}

              {/* Link Entity Form */}
              <div className="pt-4 border-t border-slate-700/50 space-y-3">
                <h3 className="text-xs font-semibold text-slate-200">Attach Relationship UUID</h3>
                <form onSubmit={(e) => { void handleLinkSubmit(e); }} className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value as 'task' | 'project' | 'learning' | 'skill')}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="task">Task ID</option>
                      <option value="project">Project ID</option>
                      <option value="learning">Learning Item ID</option>
                      <option value="skill">Skill ID</option>
                    </select>

                    <input
                      type="text"
                      required
                      placeholder="Paste entity UUID..."
                      value={entityIdInput}
                      onChange={(e) => setEntityIdInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg text-xs transition-colors"
                  >
                    + Link Relationship
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/20 border border-slate-800 rounded-xl text-slate-500 text-xs">
              Select an evidence item from the list to view details and manage entity links.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Evidence */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Add Evidence Record</h2>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KENENISA OS Planning Engine Pull Request"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EvidenceType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="PROJECT">Project</option>
                  <option value="GITHUB_REPOSITORY">GitHub Repository</option>
                  <option value="GIT_COMMIT">Git Commit</option>
                  <option value="DEPLOYMENT">Deployment</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="SCREENSHOT">Screenshot</option>
                  <option value="VIDEO">Video</option>
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="ARTICLE">Article</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">URL / Link</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
