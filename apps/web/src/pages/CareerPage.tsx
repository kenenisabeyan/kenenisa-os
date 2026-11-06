import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchOpportunities,
  fetchOpportunityAnalytics,
  transitionOpportunityStatus,
} from '../features/opportunities/api.js';
import { fetchSkills } from '../features/learning/api.js';
import { fetchProjects } from '../features/projects/api.js';
import { fetchEvidenceList } from '../features/evidence/api.js';
import { sendChatMessage } from '../features/intelligence/api.js';
import type {
  OpportunityDto,
  OpportunityAnalyticsDto,
  SkillDto,
  ProjectDto,
  EvidenceDto,
} from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';
import { Badge } from '../components/ui/Badge.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';
import { getCachedApiData } from '../lib/api-client.js';

export const CareerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [opportunities, setOpportunities] = useState<OpportunityDto[]>(
    () => getCachedApiData<OpportunityDto[]>('/api/v1/opportunities') || [],
  );
  const [analytics, setAnalytics] = useState<OpportunityAnalyticsDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>(
    () => getCachedApiData<SkillDto[]>('/api/v1/learning/skills') || [],
  );
  const [projects, setProjects] = useState<ProjectDto[]>(
    () => getCachedApiData<ProjectDto[]>('/api/v1/projects') || [],
  );
  const [evidence, setEvidence] = useState<EvidenceDto[]>([]);
  const [loading, setLoading] = useState(() => opportunities.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Active Opportunity detail view
  const [selectedOpp, setSelectedOpp] = useState<OpportunityDto | null>(() => {
    const cached = getCachedApiData<OpportunityDto[]>('/api/v1/opportunities') || [];
    return cached.length > 0 ? cached[0] : null;
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // AI Career Advisor state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleCopyAiPitch = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis);
    showToast('AI Qualification Pitch copied to clipboard!', 'success');
  };

  const loadData = useCallback(async () => {
    if (opportunities.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      const [oppsRes, analyticsRes, skillsRes, projectsRes, evidenceRes] = await Promise.allSettled([
        fetchOpportunities({ pageSize: 50 }),
        fetchOpportunityAnalytics(),
        fetchSkills(),
        fetchProjects({ pageSize: 50 }),
        fetchEvidenceList({ pageSize: 20 }),
      ]);

      if (oppsRes.status === 'fulfilled') {
        setOpportunities(oppsRes.value);
        if (oppsRes.value.length > 0 && !selectedOpp) {
          setSelectedOpp(oppsRes.value[0]);
        }
      }
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value);
      if (evidenceRes.status === 'fulfilled') setEvidence(evidenceRes.value);

      if (oppsRes.status === 'rejected' && projectsRes.status === 'rejected') {
        setError('Failed to connect to Career services. Please verify backend connectivity.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load career hub');
    } finally {
      setLoading(false);
    }
  }, [opportunities.length, selectedOpp]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusTransition = async (oppId: string, action: string) => {
    try {
      await transitionOpportunityStatus(oppId, action);
      showToast(`Opportunity updated to ${action.toLowerCase()}`, 'success');
      void loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const handleRequestAiAdvice = async (opp: OpportunityDto) => {
    setAiLoading(true);
    setAiAnalysis(null);
    try {
      const prompt = `Analyze how my software engineering projects and verified skills relate to the opportunity "${opp.title}" at ${opp.organizationName || 'organization'}. Explain why my technical evidence qualifies me for this position.`;
      const result = await sendChatMessage({ message: prompt });
      setAiAnalysis(result.message.content);
    } catch (err: unknown) {
      setAiAnalysis(err instanceof Error ? err.message : 'Failed to generate AI advice');
    } finally {
      setAiLoading(false);
    }
  };

  // Pipeline status breakdown
  const statusPipeline = [
    { label: 'DISCOVERED', count: opportunities.filter((o) => o.status === 'DISCOVERED').length, color: 'bg-slate-100 text-slate-700' },
    { label: 'EVALUATING', count: opportunities.filter((o) => o.status === 'EVALUATING').length, color: 'bg-sky-50 text-sky-700' },
    { label: 'PREPARING', count: opportunities.filter((o) => o.status === 'PREPARING').length, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'APPLIED', count: opportunities.filter((o) => o.status === 'APPLIED').length, color: 'bg-blue-50 text-blue-700' },
    { label: 'INTERVIEW', count: opportunities.filter((o) => o.status === 'INTERVIEW').length, color: 'bg-purple-50 text-purple-700' },
    { label: 'OFFERED', count: opportunities.filter((o) => o.status === 'OFFERED').length, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6" id="career-opportunity-hub-page">
      <PageHeader
        title="Career & Opportunity Hub"
        description="Connect your verified skills, projects, and concrete evidence to target career opportunities."
        breadcrumbs={[{ label: 'Grow' }, { label: 'Career Hub' }]}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate('/app/opportunities')}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] sm:text-xs transition-colors"
            >
              Opportunity Pipeline
            </button>
            <button
              onClick={() => navigate('/app/evidence')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-[11px] sm:text-xs shadow-xs transition-colors"
            >
              Evidence Vault
            </button>
          </div>
        }
      />

      <PageAiCopilot pageType="career" entityTitle={selectedOpp?.title} />

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          {/* Opportunity Pipeline Flow */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                  CAREER OPPORTUNITY LIFECYCLE PIPELINE
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {analytics?.totalOpportunities || opportunities.length} Total Tracked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {statusPipeline.map((step, idx) => (
                <div key={step.label} className={`border border-slate-200/90 rounded-2xl p-3.5 space-y-1.5 ${step.color} shadow-2xs hover:shadow-xs transition-all`}>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Stage 0{idx + 1}</span>
                  </div>
                  <p className="text-2xl font-black tracking-tight">{step.count}</p>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">{step.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skill → Project → Evidence → Opportunity Relationship Mapper */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                  SKILL &rarr; PROJECT &rarr; EVIDENCE &rarr; OPPORTUNITY MAPPING
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Factual alignment between verified engineering capabilities and target career roles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
              {/* 1. Verified Skills */}
              <div className="relative group p-[2px] rounded-2xl bg-gradient-to-b from-indigo-500 via-blue-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-indigo-500/15 blur-lg pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 space-y-2.5 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    1. Verified Skills ({skills.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {skills.slice(0, 5).map((s) => (
                      <div key={s.id} className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 flex justify-between items-center shadow-2xs">
                        <span className="truncate">{s.name}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">{s.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Active Projects */}
              <div className="relative group p-[2px] rounded-2xl bg-gradient-to-b from-blue-500 via-cyan-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/15 blur-lg pointer-events-none group-hover:bg-blue-500/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 space-y-2.5 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    2. Active Projects ({projects.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {projects.slice(0, 5).map((p) => (
                      <div key={p.id} className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 truncate shadow-2xs">
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Verified Evidence */}
              <div className="relative group p-[2px] rounded-2xl bg-gradient-to-b from-cyan-500 via-teal-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-cyan-500/15 blur-lg pointer-events-none group-hover:bg-cyan-500/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 space-y-2.5 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    3. Verified Evidence ({evidence.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {evidence.slice(0, 5).map((e) => (
                      <div key={e.id} className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 truncate shadow-2xs">
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Opportunities */}
              <div className="relative group p-[2px] rounded-2xl bg-gradient-to-b from-purple-500 via-indigo-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-purple-500/15 blur-lg pointer-events-none group-hover:bg-purple-500/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full pointer-events-none group-hover:left-1 group-hover:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 space-y-2.5 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    4. Opportunities ({opportunities.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {opportunities.slice(0, 5).map((o) => (
                      <div key={o.id} className="bg-white p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 truncate shadow-2xs">
                        {o.title} {o.organizationName ? `@ ${o.organizationName}` : ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid: Active Opportunities List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Opportunities List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Active Target Roles & Opportunities
                    </h3>
                    <p className="text-xs text-slate-500">Pipeline alignment for technical positions</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Search roles / companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium w-40 sm:w-48"
                    />

                    <select
                      value={stageFilter}
                      onChange={(e) => setStageFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="">All Stages</option>
                      <option value="DISCOVERED">Discovered</option>
                      <option value="EVALUATING">Evaluating</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFERED">Offered</option>
                    </select>

                    <button
                      onClick={() => navigate('/app/opportunities')}
                      className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Pipeline →
                    </button>
                  </div>
                </div>

                {opportunities.filter((o) => {
                  const matchQuery = !searchQuery.trim() ||
                    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (o.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase());
                  const matchStage = !stageFilter || o.status === stageFilter;
                  return matchQuery && matchStage;
                }).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80">
                    No career opportunities match the filter criteria.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities
                      .filter((o) => {
                        const matchQuery = !searchQuery.trim() ||
                          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase());
                        const matchStage = !stageFilter || o.status === stageFilter;
                        return matchQuery && matchStage;
                      })
                      .map((opp) => (
                        <div
                          key={opp.id}
                          onClick={() => setSelectedOpp(opp)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                            selectedOpp?.id === opp.id
                              ? 'bg-blue-50/60 border-[#3B82F6] ring-2 ring-blue-500/20'
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-0.5 min-w-0">
                              <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider block truncate">
                                {opp.organizationName || 'Target Organization'}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">{opp.title}</h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {opp.estimatedValue && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {opp.currency || '$'}{opp.estimatedValue.toLocaleString()}
                                </span>
                              )}
                              <Badge variant={opp.status} />
                            </div>
                          </div>

                          {opp.location && (
                            <p className="text-xs text-slate-500 mt-1">📍 Location: {opp.location}</p>
                          )}

                          <div className="pt-3 border-t border-slate-100 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 font-medium">
                            <span>Priority: <strong className="text-slate-800">{opp.priority}</strong> • Source: <strong className="text-slate-800">{opp.source}</strong></span>

                            {/* 1-Click Quick Stage Transitions on Card */}
                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleStatusTransition(opp.id, 'apply');
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                                title="Mark Applied"
                              >
                                + Apply
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleStatusTransition(opp.id, 'interview');
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-[#7e22ce] border border-purple-200 rounded-lg transition-colors cursor-pointer"
                                title="Mark Interview"
                              >
                                + Interview
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Selected Opportunity Detail & AI Advisory */}
            <div className="space-y-4">
              {selectedOpp ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                        {selectedOpp.organizationName || 'Organization'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{selectedOpp.title}</h3>
                    </div>
                    <Badge variant={selectedOpp.status} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    {selectedOpp.estimatedValue && (
                      <p><strong>Estimated Value:</strong> {selectedOpp.currency} {selectedOpp.estimatedValue.toLocaleString()}</p>
                    )}
                    {selectedOpp.sourceUrl && (
                      <p>
                        <strong>Link: </strong>
                        <a href={selectedOpp.sourceUrl} target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:underline font-mono">
                          {selectedOpp.sourceUrl}
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => void handleStatusTransition(selectedOpp.id, 'apply')}
                      className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Applied
                    </button>
                    <button
                      onClick={() => void handleStatusTransition(selectedOpp.id, 'interview')}
                      className="px-3 py-1.5 bg-[#A855F7] hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Mark Interview
                    </button>
                  </div>

                  {/* AI Career Advisor Request */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                        </span>
                        AI Advisory Insight
                      </span>
                      <button
                        onClick={() => void handleRequestAiAdvice(selectedOpp)}
                        disabled={aiLoading}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        {aiLoading ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>✨ Analyze Relevance</span>
                          </>
                        )}
                      </button>
                    </div>

                    {aiAnalysis && (
                      <div className="bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/40 border border-purple-200/80 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed shadow-2xs space-y-2">
                        <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                          <span className="text-[#7e22ce] font-black text-[11px] uppercase tracking-wider">
                            ✨ AI Strategic Alignment Pitch
                          </span>
                          <button
                            onClick={handleCopyAiPitch}
                            className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-purple-100 text-[#7e22ce] border border-purple-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            📋 Copy Pitch
                          </button>
                        </div>
                        <div className="text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                          {aiAnalysis}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-xs">
                  Select an opportunity from the list to view detailed preparation and AI advisory insights.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
