import React, { useState, useEffect } from 'react';
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
} from '../features/opportunities/api.js';

export const OpportunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [analytics, setAnalytics] = useState<OpportunityAnalyticsDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadData = React.useCallback(async () => {
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
      const created = await createOpportunity(formInput);
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
      await navigate(`/app/opportunities/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create opportunity';
      setError(msg);
    }
  };

  return (
    <div id="opportunities-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span>Career Execution & Opportunities</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-medium">
              Pipeline Engine
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track, prepare, and execute on high-value freelance contracts, engineering roles, and client opportunities.
          </p>
        </div>

        <button
          id="add-opportunity-btn"
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Opportunity
        </button>
      </div>

      {/* Analytics Summary Banner */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Active Opportunities</span>
            <div className="text-xl font-bold text-slate-900">{analytics.activeOpportunities}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Applied</span>
            <div className="text-xl font-bold text-sky-600">{analytics.appliedOpportunities}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Interviews</span>
            <div className="text-xl font-bold text-purple-600">{analytics.interviews}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Offers</span>
            <div className="text-xl font-bold text-emerald-600">{analytics.offers}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Follow-ups Due</span>
            <div className="text-xl font-bold text-amber-600">{analytics.followUpsDue}</div>
          </div>
          <div className="bg-white border border-slate-200/90 p-3.5 rounded-xl space-y-1 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Overdue Follow-ups</span>
            <div className="text-xl font-bold text-rose-600">{analytics.followUpsOverdue}</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex-1">
          <input
            type="text"
            id="opportunity-search-input"
            placeholder="Search title, organization, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <select
          id="opportunity-status-filter"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OpportunityStatus | '')}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="DISCOVERED">Discovered</option>
          <option value="EVALUATING">Evaluating</option>
          <option value="PREPARING">Preparing</option>
          <option value="APPLIED">Applied</option>
          <option value="IN_DISCUSSION">In Discussion</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFER">Offer Received</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="DECLINED">Declined</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          id="opportunity-type-filter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as OpportunityType | '')}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading career opportunities...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-800/50 p-4 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Opportunity List */}
      {!loading && !error && (
        <div className="space-y-3">
          {opportunities.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-xl font-bold">
                💼
              </div>
              <h3 className="text-base font-bold text-slate-900">No Opportunities Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Track freelance projects, career applications, and professional opportunities to organize execution.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-blue-600 font-semibold text-xs rounded-lg border border-slate-200 transition-all"
              >
                Create Opportunity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map((op) => (
                <div
                  key={op.id}
                  onClick={() => {
                    void navigate(`/app/opportunities/${op.id}`);
                  }}
                  className="bg-white hover:border-slate-300 border border-slate-200/90 p-5 rounded-2xl cursor-pointer transition-all duration-150 space-y-4 group shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                        {op.type.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                        {op.title}
                      </h3>
                      {op.organizationName && (
                        <p className="text-xs text-slate-500 font-medium">{op.organizationName}</p>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                      {op.status}
                    </span>
                  </div>

                  {op.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{op.description}</p>
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
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Create Career Opportunity</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => { void handleCreateSubmit(e); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer Role or Freelance API"
                  value={formInput.title}
                  onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Type</label>
                  <select
                    value={formInput.type}
                    onChange={(e) => setFormInput({ ...formInput, type: e.target.value as OpportunityType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                  <label className="block text-slate-700 font-medium mb-1">Status</label>
                  <select
                    value={formInput.status}
                    onChange={(e) => setFormInput({ ...formInput, status: e.target.value as OpportunityStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="DISCOVERED">Discovered</option>
                    <option value="EVALUATING">Evaluating</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="APPLIED">Applied</option>
                    <option value="IN_DISCUSSION">In Discussion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Organization / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Inc or Client Corp"
                    value={formInput.organizationName || ''}
                    onChange={(e) => setFormInput({ ...formInput, organizationName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="Recruiter or Lead Name"
                    value={formInput.contactName || ''}
                    onChange={(e) => setFormInput({ ...formInput, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description / Scope</label>
                <textarea
                  rows={3}
                  placeholder="Opportunity requirements, project budget, or interview details..."
                  value={formInput.description || ''}
                  onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                >
                  Create & View Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
