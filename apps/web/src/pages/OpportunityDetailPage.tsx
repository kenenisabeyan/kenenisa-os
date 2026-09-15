import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { OpportunityDetailDto } from '@kenenisa-os/shared';
import {
  fetchOpportunityById,
  transitionOpportunityStatus,
  linkOpportunitySkill,
  unlinkOpportunitySkill,
  linkOpportunityProject,
  unlinkOpportunityProject,
  linkOpportunityEvidence,
  unlinkOpportunityEvidence,
  linkOpportunityTask,
  unlinkOpportunityTask,
  createOpportunityActivity,
} from '../features/opportunities/api.js';

export const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opportunity, setOpportunity] = useState<OpportunityDetailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Linker Modal Inputs
  const [linkInputId, setLinkInputId] = useState<string>('');
  const [activeLinkType, setActiveLinkType] = useState<'skill' | 'project' | 'evidence' | 'task' | null>(null);

  // Activity Input
  const [actTitle, setActTitle] = useState<string>('');
  const [actDesc, setActDesc] = useState<string>('');

  const loadOpportunity = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOpportunityById(id);
      setOpportunity(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load opportunity';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOpportunity();
  }, [loadOpportunity]);

  const handleStatusTransition = async (action: string) => {
    if (!id) return;
    try {
      await transitionOpportunityStatus(id, action);
      await loadOpportunity();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status transition failed';
      setError(msg);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !linkInputId.trim() || !activeLinkType) return;
    try {
      if (activeLinkType === 'skill') {
        await linkOpportunitySkill(id, linkInputId.trim());
      } else if (activeLinkType === 'project') {
        await linkOpportunityProject(id, linkInputId.trim());
      } else if (activeLinkType === 'evidence') {
        await linkOpportunityEvidence(id, linkInputId.trim());
      } else if (activeLinkType === 'task') {
        await linkOpportunityTask(id, linkInputId.trim());
      }
      setActiveLinkType(null);
      setLinkInputId('');
      await loadOpportunity();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link item';
      setError(msg);
    }
  };

  const handleUnlink = async (type: 'skill' | 'project' | 'evidence' | 'task', targetId: string) => {
    if (!id) return;
    try {
      if (type === 'skill') await unlinkOpportunitySkill(id, targetId);
      if (type === 'project') await unlinkOpportunityProject(id, targetId);
      if (type === 'evidence') await unlinkOpportunityEvidence(id, targetId);
      if (type === 'task') await unlinkOpportunityTask(id, targetId);
      await loadOpportunity();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unlink item';
      setError(msg);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !actTitle.trim()) return;
    try {
      await createOpportunityActivity(id, {
        title: actTitle.trim(),
        description: actDesc.trim() || null,
      });
      setActTitle('');
      setActDesc('');
      await loadOpportunity();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to log activity';
      setError(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading opportunity workspace...</span>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { void navigate('/app/opportunities'); }}
          className="text-xs text-cyan-400 font-semibold flex items-center gap-1 hover:underline"
        >
          ← Back to Opportunities
        </button>
        <div className="bg-red-950/40 border border-red-800/50 p-4 rounded-xl text-red-300 text-sm">
          {error || 'Opportunity not found.'}
        </div>
      </div>
    );
  }

  return (
    <div id="opportunity-detail-page" className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => { void navigate('/app/opportunities'); }}
        className="text-xs text-slate-400 font-semibold flex items-center gap-1 hover:text-white transition-colors"
      >
        ← Back to Opportunities
      </button>

      {/* Header Card */}
      <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                {opportunity.type.replace('_', ' ')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                {opportunity.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{opportunity.title}</h1>
            {opportunity.organizationName && (
              <p className="text-xs text-slate-400 font-medium">
                Organization: <span className="text-slate-200 font-semibold">{opportunity.organizationName}</span>
              </p>
            )}
          </div>

          {/* Quick Lifecycle Actions */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { void handleStatusTransition('apply'); }}
              className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold"
            >
              Applied
            </button>
            <button
              onClick={() => { void handleStatusTransition('interview'); }}
              className="px-2.5 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold"
            >
              Interview
            </button>
            <button
              onClick={() => { void handleStatusTransition('offer'); }}
              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold"
            >
              Offered
            </button>
            <button
              onClick={() => { void handleStatusTransition('accept'); }}
              className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold"
            >
              Accepted
            </button>
            <button
              onClick={() => { void handleStatusTransition('complete'); }}
              className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold"
            >
              Completed
            </button>
            <button
              onClick={() => { void handleStatusTransition('reject'); }}
              className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[11px] font-semibold"
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Opportunity Details Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400">Source:</span>
            <div className="font-semibold text-slate-200 mt-0.5">{opportunity.source}</div>
          </div>
          <div>
            <span className="text-slate-400">Value Estimate:</span>
            <div className="font-semibold text-emerald-400 mt-0.5">
              {opportunity.estimatedValue
                ? `${opportunity.currency} ${opportunity.estimatedValue.toLocaleString()}`
                : 'Unspecified'}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Deadline:</span>
            <div className="font-semibold text-amber-400 mt-0.5">
              {opportunity.deadline ? opportunity.deadline.split('T')[0] : 'None'}
            </div>
          </div>
          <div>
            <span className="text-slate-400">Follow-up Date:</span>
            <div className="font-semibold text-purple-300 mt-0.5">
              {opportunity.followUpDate ? opportunity.followUpDate.split('T')[0] : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Linked Artifacts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Linked Skills */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Relevant Skills</span>
                <span className="text-xs text-slate-400 font-normal">({opportunity.skills.length})</span>
              </h3>
              <button
                onClick={() => setActiveLinkType('skill')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                + Link Skill
              </button>
            </div>

            {opportunity.skills.length === 0 ? (
              <p className="text-xs text-slate-500">No skills linked to this opportunity.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {opportunity.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-lg font-medium"
                  >
                    <span>{s.skill?.name || s.skillId}</span>
                    <button
                      onClick={() => { void handleUnlink('skill', s.skillId); }}
                      className="text-purple-400 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Linked Projects */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Supporting Projects</span>
                <span className="text-xs text-slate-400 font-normal">({opportunity.projects.length})</span>
              </h3>
              <button
                onClick={() => setActiveLinkType('project')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                + Link Project
              </button>
            </div>

            {opportunity.projects.length === 0 ? (
              <p className="text-xs text-slate-500">No projects linked to this opportunity.</p>
            ) : (
              <div className="space-y-2">
                {opportunity.projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                  >
                    <span className="font-semibold text-slate-200">{p.project?.name || p.projectId}</span>
                    <button
                      onClick={() => { void handleUnlink('project', p.projectId); }}
                      className="text-slate-400 hover:text-red-400 text-xs font-semibold"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supporting Evidence */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Supporting Evidence</span>
                <span className="text-xs text-slate-400 font-normal">({opportunity.evidence.length})</span>
              </h3>
              <button
                onClick={() => setActiveLinkType('evidence')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                + Link Evidence
              </button>
            </div>

            {opportunity.evidence.length === 0 ? (
              <p className="text-xs text-slate-500">No evidence attached to this opportunity.</p>
            ) : (
              <div className="space-y-2">
                {opportunity.evidence.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{e.evidence?.title || e.evidenceId}</span>
                      <span className="ml-2 text-[10px] text-cyan-400">{e.evidence?.type}</span>
                    </div>
                    <button
                      onClick={() => { void handleUnlink('evidence', e.evidenceId); }}
                      className="text-slate-400 hover:text-red-400 text-xs font-semibold"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Tasks */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Preparation & Action Tasks</span>
                <span className="text-xs text-slate-400 font-normal">({opportunity.tasks.length})</span>
              </h3>
              <button
                onClick={() => setActiveLinkType('task')}
                className="text-xs text-cyan-400 hover:underline font-semibold"
              >
                + Link Task
              </button>
            </div>

            {opportunity.tasks.length === 0 ? (
              <p className="text-xs text-slate-500">No preparation tasks linked to this opportunity.</p>
            ) : (
              <div className="space-y-2">
                {opportunity.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{t.task?.title || t.taskId}</span>
                      <span className="ml-2 text-[10px] text-slate-400">{t.task?.status}</span>
                    </div>
                    <button
                      onClick={() => { void handleUnlink('task', t.taskId); }}
                      className="text-slate-400 hover:text-red-400 text-xs font-semibold"
                    >
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Professional Timeline Log */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-white">Professional Timeline Log</h3>

            <form onSubmit={(e) => { void handleAddActivity(e); }} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Log activity title (e.g. Sent follow-up email)"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <textarea
                rows={2}
                placeholder="Notes or conversation details..."
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors"
              >
                Log Activity
              </button>
            </form>

            <div className="space-y-3 pt-3 border-t border-slate-800">
              {opportunity.activities.length === 0 ? (
                <p className="text-xs text-slate-500">No activity logs recorded.</p>
              ) : (
                opportunity.activities.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{a.title}</span>
                      <span className="text-[10px] text-slate-500">{a.occurredAt.split('T')[0]}</span>
                    </div>
                    {a.description && <p className="text-slate-400 text-[11px]">{a.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Linker Modal */}
      {activeLinkType && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white capitalize">Link {activeLinkType}</h3>
              <button onClick={() => setActiveLinkType(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { void handleLinkSubmit(e); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Enter {activeLinkType} ID (UUID)
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Paste ${activeLinkType} ID...`}
                  value={linkInputId}
                  onChange={(e) => setLinkInputId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveLinkType(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold text-xs rounded-xl"
                >
                  Link {activeLinkType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
