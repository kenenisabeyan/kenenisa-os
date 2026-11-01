import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  OpportunityDto,
  OpportunityStatus,
  OpportunityType,
  OpportunityAnalyticsDto,
  CreateOpportunityInput,
} from '@kenenisa-os/shared';
import {
  fetchOpportunities,
  fetchOpportunityAnalytics,
  createOpportunity,
  updateOpportunity,
} from '../features/opportunities/api.js';
import { useToast } from '../components/ui/Toast.js';
import { PageAiCopilot } from '../components/ai/PageAiCopilot.js';

interface PipelineColumn {
  id: string;
  label: string;
  statuses: OpportunityStatus[];
  dotColor: string;
  createStatus: OpportunityStatus;
}

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    id: 'DISCOVERED',
    label: '1. Sourced & Preparing',
    statuses: ['DISCOVERED', 'EVALUATING', 'PREPARING'],
    dotColor: 'bg-slate-400',
    createStatus: 'DISCOVERED',
  },
  {
    id: 'APPLIED',
    label: '2. Applied & Outreach',
    statuses: ['APPLIED', 'IN_DISCUSSION'],
    dotColor: 'bg-blue-600',
    createStatus: 'APPLIED',
  },
  {
    id: 'INTERVIEW',
    label: '3. Interviewing',
    statuses: ['INTERVIEW'],
    dotColor: 'bg-purple-600',
    createStatus: 'INTERVIEW',
  },
  {
    id: 'OFFERED',
    label: '4. Offer Received',
    statuses: ['OFFERED'],
    dotColor: 'bg-emerald-600',
    createStatus: 'OFFERED',
  },
  {
    id: 'ACCEPTED',
    label: '5. Closed & Won',
    statuses: ['ACCEPTED', 'ACTIVE', 'COMPLETED'],
    dotColor: 'bg-cyan-600',
    createStatus: 'ACCEPTED',
  },
];

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [analytics, setAnalytics] = useState<OpportunityAnalyticsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // View Mode: Notion Pipeline Board vs Grid Gallery
  const [viewMode, setViewMode] = useState<'board' | 'grid'>(() => {
    return (localStorage.getItem('kenenisa_opps_view_mode') as 'board' | 'grid') || 'board';
  });

  const handleSetViewMode = (mode: 'board' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('kenenisa_opps_view_mode', mode);
  };

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<OpportunityStatus | ''>('');
  const [selectedType, setSelectedType] = useState<OpportunityType | ''>('');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formInput, setFormInput] = useState<CreateOpportunityInput>({
    title: '',
    description: '',
    type: 'FULL_TIME',
    status: 'DISCOVERED',
    priority: 'P2',
    organizationName: '',
    contactName: '',
    contactEmail: '',
    source: 'OTHER',
    sourceUrl: '',
    location: '',
    remote: false,
    estimatedValue: undefined,
    currency: 'USD',
    deadline: '',
    followUpDate: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, analyticsRes] = await Promise.all([
        fetchOpportunities({
          search: search || undefined,
          status: selectedStatus || undefined,
          type: selectedType || undefined,
        }),
        fetchOpportunityAnalytics(),
      ]);
      setOpportunities(listRes);
      setAnalytics(analyticsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load opportunities';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStatus, selectedType]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInput.title.trim()) return;
    try {
      await createOpportunity(formInput);
      showToast('Opportunity created successfully', 'success');
      setShowModal(false);
      setFormInput({
        title: '',
        description: '',
        type: 'FULL_TIME',
        status: 'DISCOVERED',
        priority: 'P2',
        organizationName: '',
        contactName: '',
        contactEmail: '',
        source: 'OTHER',
        sourceUrl: '',
        location: '',
        remote: false,
        estimatedValue: undefined,
        currency: 'USD',
        deadline: '',
        followUpDate: '',
      });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create opportunity';
      showToast(msg, 'error');
    }
  };

  const handleQuickStatusChange = async (e: React.MouseEvent, oppId: string, newStatus: OpportunityStatus) => {
    e.stopPropagation();
    try {
      await updateOpportunity(oppId, { status: newStatus });
      showToast(`Moved opportunity to ${newStatus.replace('_', ' ')}`, 'success');
      await loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to move opportunity', 'error');
    }
  };

  const openCreateForStatus = (st: OpportunityStatus) => {
    setFormInput((prev) => ({ ...prev, status: st }));
    setShowModal(true);
  };

  // Group opportunities by pipeline column
  const oppsByColumn = useMemo(() => {
    const map: Record<string, OpportunityDto[]> = {
      DISCOVERED: [],
      APPLIED: [],
      INTERVIEW: [],
      OFFERED: [],
      ACCEPTED: [],
    };

    opportunities.forEach((op) => {
      let matched = false;
      for (const col of PIPELINE_COLUMNS) {
        if (col.statuses.includes(op.status)) {
          map[col.id].push(op);
          matched = true;
          break;
        }
      }
      if (!matched) {
        map.DISCOVERED.push(op);
      }
    });

    return map;
  }, [opportunities]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
            Career & Opportunity Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Notion-style deal pipeline tracking freelance contracts, client leads, and career roles.
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
                  ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title="Switch to Pipeline Kanban Board"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <span>Pipeline Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-2xs border border-blue-200/80 font-black'
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
              setFormInput((prev) => ({ ...prev, status: 'DISCOVERED' }));
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Total Pipeline</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900">{analytics.totalOpportunities}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Applied</span>
            <div className="text-lg sm:text-xl font-bold text-blue-600">{analytics.appliedOpportunities}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Interviews</span>
            <div className="text-lg sm:text-xl font-bold text-purple-600">{analytics.interviews}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Offers</span>
            <div className="text-lg sm:text-xl font-bold text-emerald-600">{analytics.offers}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Follow-ups Due</span>
            <div className="text-lg sm:text-xl font-bold text-amber-600">{analytics.followUpsDue}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-2xl space-y-1 shadow-xs">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Pipeline Value</span>
            <div className="text-lg sm:text-xl font-bold text-cyan-700">
              ${opportunities.reduce((acc, op) => acc + (op.estimatedValue || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            id="opportunity-search-input"
            placeholder="Search role, client company, contact or stack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          <select
            id="opportunity-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OpportunityStatus | '')}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="EVALUATING">Evaluating</option>
            <option value="PREPARING">Preparing</option>
            <option value="APPLIED">Applied</option>
            <option value="IN_DISCUSSION">In Discussion</option>
            <option value="INTERVIEW">Interviewing</option>
            <option value="OFFERED">Offer Received</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            id="opportunity-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as OpportunityType | '')}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="FREELANCE">Freelance</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CLIENT">Client</option>
            <option value="RESEARCH">Research</option>
            <option value="COMPETITION">Competition</option>
            <option value="OTHER">Other</option>
          </select>

          {(search || selectedStatus || selectedType) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedStatus('');
                setSelectedType('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading career pipeline...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
            💼
          </div>
          <h3 className="text-base font-bold text-slate-900">No Opportunities Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track freelance contracts, career roles, and client leads in your Notion-style pipeline.
          </p>
          <button
            onClick={() => {
              setFormInput((prev) => ({ ...prev, status: 'DISCOVERED' }));
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Create First Opportunity
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           NOTION-STYLE PIPELINE KANBAN BOARD VIEW
           ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
          {PIPELINE_COLUMNS.map((col) => {
            const colOpps = oppsByColumn[col.id] || [];
            const colValue = colOpps.reduce((sum, op) => sum + (op.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
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
                      {colOpps.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreateForStatus(col.createStatus)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title={`Add to ${col.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{colOpps.length} lead(s)</span>
                  <span>{colValue > 0 ? `$${colValue.toLocaleString()}` : '$0'}</span>
                </div>

                {/* Column Cards */}
                <div className="p-2.5 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                  {colOpps.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 font-medium">No leads in stage</p>
                      <button
                        type="button"
                        onClick={() => openCreateForStatus(col.createStatus)}
                        className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        + Add Lead
                      </button>
                    </div>
                  ) : (
                    colOpps.map((op) => (
                      <div
                        key={op.id}
                        onClick={() => void navigate(`/app/opportunities/${op.id}`)}
                        className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all space-y-3 group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 truncate">
                            {op.type.replace('_', ' ')}
                          </span>

                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/70">
                            {op.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {op.title}
                          </h4>
                          {op.organizationName && (
                            <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                              🏢 {op.organizationName}
                            </p>
                          )}
                        </div>

                        {op.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {op.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                          <div>
                            {op.estimatedValue ? (
                              <span className="font-bold text-emerald-700">
                                {op.currency} {op.estimatedValue.toLocaleString()}
                              </span>
                            ) : (
                              <span>Open Budget</span>
                            )}
                          </div>
                          {op.deadline && (
                            <span className="font-mono text-amber-700 font-bold">
                              Due: {op.deadline.split('T')[0]}
                            </span>
                          )}
                        </div>

                        {/* Quick Stage Transitions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1">
                            {col.id !== 'APPLIED' && (
                              <button
                                type="button"
                                onClick={(e) => void handleQuickStatusChange(e, op.id, 'APPLIED')}
                                className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                                title="Move to Applied"
                              >
                                Apply
                              </button>
                            )}
                            {col.id !== 'INTERVIEW' && (
                              <button
                                type="button"
                                onClick={(e) => void handleQuickStatusChange(e, op.id, 'INTERVIEW')}
                                className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold transition-colors cursor-pointer"
                                title="Move to Interviewing"
                              >
                                Interview
                              </button>
                            )}
                            {col.id !== 'OFFERED' && (
                              <button
                                type="button"
                                onClick={(e) => void handleQuickStatusChange(e, op.id, 'OFFERED')}
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                                title="Move to Offer"
                              >
                                Offer
                              </button>
                            )}
                            {col.id !== 'ACCEPTED' && (
                              <button
                                type="button"
                                onClick={(e) => void handleQuickStatusChange(e, op.id, 'ACCEPTED')}
                                className="px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold transition-colors cursor-pointer"
                                title="Mark as Won & Accepted"
                              >
                                ✓ Won
                              </button>
                            )}
                          </div>

                          <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                            &rarr;
                          </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((op) => (
            <div
              key={op.id}
              onClick={() => {
                void navigate(`/app/opportunities/${op.id}`);
              }}
              className="bg-white hover:border-blue-300 border border-slate-200/90 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-150 space-y-4 group shadow-xs hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider inline-block">
                    {op.type.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">
                    {op.title}
                  </h3>
                  {op.organizationName && (
                    <p className="text-xs text-slate-500 font-medium truncate">{op.organizationName}</p>
                  )}
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                  {op.status}
                </span>
              </div>

              {op.description && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{op.description}</p>
              )}

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <div>
                  {op.estimatedValue ? (
                    <span className="font-semibold text-emerald-600">
                      {op.currency} {op.estimatedValue.toLocaleString()}
                    </span>
                  ) : (
                    <span>Priority: {op.priority}</span>
                  )}
                </div>
                {op.deadline && (
                  <span className="text-[11px] text-amber-700 font-medium">
                    Due: {op.deadline.split('T')[0]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Create Career Opportunity</h2>
                {formInput.status && (
                  <p className="text-[11px] text-slate-500">
                    Stage: <strong className="text-blue-600">{formInput.status}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer Role or Freelance Monorepo Architecture"
                  value={formInput.title}
                  onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Type</label>
                  <select
                    value={formInput.type}
                    onChange={(e) => setFormInput({ ...formInput, type: e.target.value as OpportunityType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="CLIENT">Client</option>
                    <option value="RESEARCH">Research</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Status / Stage</label>
                  <select
                    value={formInput.status}
                    onChange={(e) => setFormInput({ ...formInput, status: e.target.value as OpportunityStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="DISCOVERED">Discovered</option>
                    <option value="EVALUATING">Evaluating</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="APPLIED">Applied</option>
                    <option value="IN_DISCUSSION">In Discussion</option>
                    <option value="INTERVIEW">Interviewing</option>
                    <option value="OFFERED">Offer Received</option>
                    <option value="ACCEPTED">Accepted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Organization / Client Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, or Freelance Client"
                    value={formInput.organizationName || ''}
                    onChange={(e) => setFormInput({ ...formInput, organizationName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Contact Name / Lead</label>
                  <input
                    type="text"
                    placeholder="Recruiter or Engineering Lead"
                    value={formInput.contactName || ''}
                    onChange={(e) => setFormInput({ ...formInput, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Est. Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={formInput.estimatedValue || ''}
                    onChange={(e) => setFormInput({ ...formInput, estimatedValue: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Currency</label>
                  <input
                    type="text"
                    value={formInput.currency || 'USD'}
                    onChange={(e) => setFormInput({ ...formInput, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formInput.deadline || ''}
                    onChange={(e) => setFormInput({ ...formInput, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Project Scope</label>
                <textarea
                  rows={3}
                  placeholder="Opportunity requirements, interview preparation, tech stack..."
                  value={formInput.description || ''}
                  onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded Central AI Copilot */}
      <PageAiCopilot pageType="career" />
    </div>
  );
};
