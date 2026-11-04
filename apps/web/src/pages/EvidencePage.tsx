import React, { useState, useEffect, useCallback } from 'react';
import { EvidenceDto, EvidenceType } from '@kenenisa-os/shared';
import {
  fetchEvidenceList,
  createEvidence,
  deleteEvidence,
  linkEvidenceTask,
  linkEvidenceProject,
  linkEvidenceLearningItem,
  linkEvidenceSkill,
} from '../features/evidence/api.js';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, EmptyStateCard, ErrorStateCard } from '../components/ui/StateCard.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

export const EvidencePage: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<EvidenceDto[]>(
    () => getCachedApiData<EvidenceDto[]>('/api/v1/evidence') || [],
  );
  const [loading, setLoading] = useState(() => items.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<EvidenceDto | null>(() => {
    const cached = getCachedApiData<EvidenceDto[]>('/api/v1/evidence') || [];
    return cached.length > 0 ? cached[0] : null;
  });

  // Multi-View Mode
  const [viewMode, setViewMode] = useState<'gallery' | 'board' | 'list'>(() => {
    return (localStorage.getItem('kenenisa_evidence_view') as 'gallery' | 'board' | 'list') || 'gallery';
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal: Create Evidence
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EvidenceType>('PROJECT');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [externalReference, setExternalReference] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Linking forms
  const [linkType, setLinkType] = useState<'task' | 'project' | 'learning' | 'skill'>('task');
  const [entityIdInput, setEntityIdInput] = useState('');

  const handleSetViewMode = (mode: 'gallery' | 'board' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_evidence_view', mode);
  };

  const handleCopyLink = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast('Evidence URL copied to clipboard', 'info');
  };

  const getTypeBadgeStyle = (t: EvidenceType) => {
    switch (t) {
      case 'GITHUB_REPOSITORY':
      case 'GIT_COMMIT':
        return 'bg-purple-50 text-[#7e22ce] border-purple-200';
      case 'DEPLOYMENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROJECT':
        return 'bg-blue-50 text-[#0284c7] border-blue-200';
      case 'CERTIFICATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DOCUMENT':
      case 'ARTICLE':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const loadData = useCallback(async () => {
    if (items.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchEvidenceList({
        type: (typeFilter as EvidenceType) || undefined,
        search: searchQuery || undefined,
      });
      setItems(data);
      if (data.length > 0 && !activeItem) {
        setActiveItem(data[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load evidence records');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery, activeItem, items.length]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const created = await createEvidence({
        title: title.trim(),
        type,
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        externalReference: externalReference.trim() || undefined,
        date: date || undefined,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setUrl('');
      setExternalReference('');
      setActiveItem(created);
      showToast('Evidence record created', 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create evidence record', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evidence item?')) return;
    try {
      await deleteEvidence(id);
      showToast('Evidence item deleted', 'info');
      if (activeItem?.id === id) {
        setActiveItem(null);
      }
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete evidence item', 'error');
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
      showToast('Relationship linked successfully', 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to link relationship', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Vault & Output History"
        description="Observable proof of work, technical artifacts, commits, deployments, and publications."
        breadcrumbs={[{ label: 'Proof' }, { label: 'Evidence' }]}
        actions={
          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setUrl('');
              setExternalReference('');
              setDate(new Date().toISOString().split('T')[0]);
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Evidence
          </button>
        }
      />

      {/* Filter & View Mode Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search evidence records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

        {/* View Switcher: Gallery Grid vs Type Board vs Master List */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => handleSetViewMode('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'gallery'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🗂️ Gallery Grid
          </button>
          <button
            onClick={() => handleSetViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'board'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Type Board
          </button>
          <button
            onClick={() => handleSetViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📑 List & Linker
          </button>
        </div>
      </div>

      {/* VIEW MODES */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : items.length === 0 ? (
        <EmptyStateCard
          title="No evidence records captured yet"
          description="Attach tangible proof (commits, deployments, docs) to tasks and projects."
          actionLabel="Add Evidence"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <>
          {/* MODE 1: NOTION-STYLE ARTIFACT CARDS GALLERY */}
          {viewMode === 'gallery' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-sm hover:border-slate-300 space-y-3.5 flex flex-col justify-between ${
                    activeItem?.id === item.id ? 'ring-2 ring-emerald-400 border-emerald-300' : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-extrabold uppercase tracking-wider rounded-md ${getTypeBadgeStyle(item.type)}`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm tracking-tight leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {/* URL or Reference with 1-Click Copy */}
                    {item.url ? (
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:underline truncate max-w-[200px] font-mono"
                        >
                          🔗 {item.url}
                        </a>
                        <button
                          onClick={(e) => handleCopyLink(item.url!, e)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Copy Link"
                        >
                          📋 Copy
                        </button>
                      </div>
                    ) : item.externalReference ? (
                      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                        <span className="text-xs text-slate-600 font-mono truncate max-w-[200px]">
                          Ref: {item.externalReference}
                        </span>
                        <button
                          onClick={(e) => handleCopyLink(item.externalReference!, e)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors cursor-pointer shrink-0"
                          title="Copy Reference"
                        >
                          📋 Copy
                        </button>
                      </div>
                    ) : null}

                    {/* Relationship Badges */}
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {item.projects?.map((p) => (
                        <span key={p.id} className="px-2 py-0.5 bg-sky-50 text-[#0284c7] border border-sky-200 rounded-md font-semibold truncate max-w-[150px]">
                          Proj: {p.project?.name ?? p.projectId}
                        </span>
                      ))}
                      {item.tasks?.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold truncate max-w-[150px]">
                          Task: {t.task?.title ?? t.taskId}
                        </span>
                      ))}
                      {item.skills?.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-[#7e22ce] rounded-md font-semibold truncate max-w-[150px]">
                          Skill: {s.skill?.name ?? s.skillId}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveItem(item);
                          handleSetViewMode('list');
                        }}
                        className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Inspect & Link →
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors text-xs font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODE 2: TYPE GROUPED BOARD */}
          {viewMode === 'board' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Code & Commits',
                  types: ['GITHUB_REPOSITORY', 'GIT_COMMIT'],
                  badge: 'bg-purple-50 text-purple-700 border-purple-200',
                },
                {
                  title: 'Deployments & Projects',
                  types: ['DEPLOYMENT', 'PROJECT'],
                  badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
                {
                  title: 'Docs & Publications',
                  types: ['DOCUMENT', 'ARTICLE', 'ASSIGNMENT'],
                  badge: 'bg-sky-50 text-sky-700 border-sky-200',
                },
                {
                  title: 'Certificates & Media',
                  types: ['CERTIFICATE', 'SCREENSHOT', 'VIDEO'],
                  badge: 'bg-amber-50 text-amber-700 border-amber-200',
                },
              ].map((col) => {
                const colItems = items.filter((i) => col.types.includes(i.type));

                return (
                  <div key={col.title} className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-3 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{col.title}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                        {colItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                      {colItems.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                          No {col.title.toLowerCase()}
                        </div>
                      ) : (
                        colItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setActiveItem(item)}
                            className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${getTypeBadgeStyle(item.type)}`}>
                                {item.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                            </div>

                            <h5 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                              {item.title}
                            </h5>

                            {item.url && (
                              <div className="flex items-center justify-between gap-1 pt-1">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] text-blue-600 hover:underline truncate max-w-[150px]"
                                >
                                  🔗 Link
                                </a>
                                <button
                                  onClick={(e) => handleCopyLink(item.url!, e)}
                                  className="text-[10px] text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                                >
                                  📋 Copy
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 3: MASTER LIST & RELATIONSHIP LINKER */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Timeline Cards */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer shadow-xs ${
                      activeItem?.id === item.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-md mb-1.5 ${getTypeBadgeStyle(item.type)}`}>
                          {item.type.replace('_', ' ')}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm tracking-tight">{item.title}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}

                    {item.url && (
                      <div className="flex items-center gap-2 mt-2.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium truncate max-w-full"
                        >
                          🔗 {item.url}
                        </a>
                        <button
                          onClick={(e) => handleCopyLink(item.url!, e)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {/* Relationship Badges */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                      {item.projects?.map((p) => (
                        <span key={p.id} className="px-2 py-0.5 bg-sky-50 text-[#0284c7] border border-sky-200 rounded-md font-semibold">
                          Project: {p.project?.name ?? p.projectId}
                        </span>
                      ))}
                      {item.tasks?.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold">
                          Task: {t.task?.title ?? t.taskId}
                        </span>
                      ))}
                      {item.learningItems?.map((l) => (
                        <span key={l.id} className="px-2 py-0.5 bg-sky-50 border border-sky-200 text-[#0284c7] rounded-md font-semibold">
                          Learning: {l.learningItem?.title ?? l.learningItemId}
                        </span>
                      ))}
                      {item.skills?.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-[#7e22ce] rounded-md font-semibold">
                          Skill: {s.skill?.name ?? s.skillId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Evidence Detail & Linker */}
              <div className="lg:col-span-1">
                {activeItem ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-5 sticky top-6 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeBadgeStyle(activeItem.type)}`}>
                          {activeItem.type.replace('_', ' ')}
                        </span>
                        <h2 className="text-base font-semibold text-slate-900 tracking-tight mt-1">{activeItem.title}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Date: {activeItem.date}</p>
                      </div>
                      <button
                        onClick={() => { void handleDelete(activeItem.id); }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                    {activeItem.description && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Description</p>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/90">
                          {activeItem.description}
                        </p>
                      </div>
                    )}

                    {activeItem.url && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">URL / Reference</p>
                        <div className="flex items-center gap-2">
                          <a
                            href={activeItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline break-all font-mono"
                          >
                            {activeItem.url}
                          </a>
                          <button
                            onClick={(e) => handleCopyLink(activeItem.url!, e)}
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Link Entity Form */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="text-xs font-semibold text-slate-900">Attach Relationship UUID</h3>
                      <form onSubmit={(e) => { void handleLinkSubmit(e); }} className="space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={linkType}
                            onChange={(e) => setLinkType(e.target.value as 'task' | 'project' | 'learning' | 'skill')}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                            className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Link Relationship
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
                    Select an evidence record to inspect relationships.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Create Evidence */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add Evidence Record</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. KENENISA OS Planning Engine Pull Request"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EvidenceType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">URL / Link</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Central AI Copilot */}
      <PageAiCopilot pageType="evidence" />
    </div>
  );
};
