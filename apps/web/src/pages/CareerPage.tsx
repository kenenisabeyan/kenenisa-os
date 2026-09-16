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

export const CareerPage: React.FC = () => {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [analytics, setAnalytics] = useState<OpportunityAnalyticsDto | null>(null);
  const [skills, setSkills] = useState<SkillDto[]>([]);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Opportunity detail view
  const [selectedOpp, setSelectedOpp] = useState<OpportunityDto | null>(null);

  // AI Career Advisor state
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppsData, analyticsData, skillsData, projectsData, evidenceData] = await Promise.all([
        fetchOpportunities({ pageSize: 50 }),
        fetchOpportunityAnalytics(),
        fetchSkills(),
        fetchProjects({ pageSize: 50 }),
        fetchEvidenceList({ pageSize: 20 }),
      ]);

      setOpportunities(oppsData);
      setAnalytics(analyticsData);
      setSkills(skillsData);
      setProjects(projectsData);
      setEvidence(evidenceData);

      if (oppsData.length > 0 && !selectedOpp) {
        setSelectedOpp(oppsData[0]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load career hub');
    } finally {
      setLoading(false);
    }
  }, [selectedOpp]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStatusTransition = async (oppId: string, action: string) => {
    try {
      await transitionOpportunityStatus(oppId, action);
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/opportunities')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Opportunity Pipeline
            </button>
            <button
              onClick={() => navigate('/app/evidence')}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Evidence Vault
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingSkeleton rows={5} height="h-32" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          {/* Opportunity Pipeline Flow */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Career Opportunity Lifecycle Pipeline
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {analytics?.totalOpportunities || opportunities.length} Total Tracked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {statusPipeline.map((step) => (
                <div key={step.label} className={`border border-slate-200/90 rounded-xl p-3 space-y-1 ${step.color}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider">{step.label}</p>
                  <p className="text-2xl font-bold">{step.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skill → Project → Evidence → Opportunity Relationship Mapper */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Skill → Project → Evidence → Opportunity Mapping
                </h2>
                <p className="text-xs text-slate-500">
                  Factual alignment between verified capabilities and target career roles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">
                  1. Verified Skills ({skills.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {skills.slice(0, 5).map((s) => (
                    <div key={s.id} className="bg-white p-2 rounded-lg border border-slate-200 font-semibold text-slate-800 flex justify-between">
                      <span>{s.name}</span>
                      <span className="text-[10px] text-[#6366F1]">{s.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                  2. Active Projects ({projects.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {projects.slice(0, 5).map((p) => (
                    <div key={p.id} className="bg-white p-2 rounded-lg border border-slate-200 font-semibold text-slate-800 truncate">
                      {p.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#3AB1EC] uppercase tracking-wider">
                  3. Verified Evidence ({evidence.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {evidence.slice(0, 5).map((e) => (
                    <div key={e.id} className="bg-white p-2 rounded-lg border border-slate-200 font-semibold text-slate-800 truncate">
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">
                  4. Opportunities ({opportunities.length})
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {opportunities.slice(0, 5).map((o) => (
                    <div key={o.id} className="bg-white p-2 rounded-lg border border-slate-200 font-semibold text-slate-800 truncate">
                      {o.title} {o.organizationName ? `@ ${o.organizationName}` : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid: Active Opportunities List + Detail Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Opportunities List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Active Target Roles & Opportunities
                  </h3>
                  <button
                    onClick={() => navigate('/app/opportunities')}
                    className="text-xs font-semibold text-[#3B82F6] hover:underline"
                  >
                    Manage Pipeline →
                  </button>
                </div>

                {opportunities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200/80">
                    No career opportunities tracked yet. Add your first opportunity target.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedOpp(opp)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs ${
                          selectedOpp?.id === opp.id
                            ? 'bg-blue-50/60 border-[#3B82F6] ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
                              {opp.organizationName || 'Target Organization'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">{opp.title}</h4>
                          </div>
                          <Badge variant={opp.status} />
                        </div>

                        {opp.location && (
                          <p className="text-xs text-slate-500 mt-1">📍 Location: {opp.location}</p>
                        )}

                        <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>Priority: <strong className="text-slate-800">{opp.priority}</strong></span>
                          <span>Source: <strong className="text-slate-800">{opp.source}</strong></span>
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
                      <p><strong>Estimated Value:</strong> {selectedOpp.currency} {selectedOpp.estimatedValue}</p>
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
                      className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Mark Applied
                    </button>
                    <button
                      onClick={() => void handleStatusTransition(selectedOpp.id, 'interview')}
                      className="px-3 py-1.5 bg-[#A855F7] hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Mark Interview
                    </button>
                  </div>

                  {/* AI Career Advisor Request */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7e22ce] uppercase tracking-wider">
                        AI Advisory Insight
                      </span>
                      <button
                        onClick={() => void handleRequestAiAdvice(selectedOpp)}
                        disabled={aiLoading}
                        className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#7e22ce] border border-purple-200 font-bold text-xs rounded-lg transition-colors"
                      >
                        {aiLoading ? 'Analyzing...' : 'Analyze Relevance'}
                      </button>
                    </div>

                    {aiAnalysis && (
                      <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-normal">
                        <span className="font-bold text-[#7e22ce] block mb-1">[AI Advisory Analysis]</span>
                        {aiAnalysis}
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
