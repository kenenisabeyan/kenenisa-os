import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchWeeklyReviews,
  fetchWeeklyReviewContext,
  createWeeklyReview,
  updateWeeklyReview,
  completeWeeklyReview,
  reopenWeeklyReview,
} from '../features/reviews/api.js';
import type { WeeklyReviewDto, WeeklyReviewContextDto } from '@kenenisa-os/shared';
import { PageHeader } from '../components/layout/PageHeader.js';
import { LoadingSkeleton, ErrorStateCard } from '../components/ui/StateCard.js';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<WeeklyReviewDto[]>([]);
  const [activeReview, setActiveReview] = useState<WeeklyReviewDto | null>(null);
  const [context, setContext] = useState<WeeklyReviewContextDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [lessons, setLessons] = useState('');
  const [nextFocus, setNextFocus] = useState('');
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState<'CONTINUE' | 'ADJUST' | 'DEFER' | 'STOP' | 'INVESTIGATE'>('CONTINUE');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsData, contextData] = await Promise.all([
        fetchWeeklyReviews(),
        fetchWeeklyReviewContext(),
      ]);
      setReviews(reviewsData);
      setContext(contextData);

      if (reviewsData.length > 0 && !activeReview) {
        const first = reviewsData[0];
        setActiveReview(first);
        setWins(first.wins || '');
        setChallenges(first.challenges || '');
        setLessons(first.lessons || '');
        setNextFocus(first.nextFocus || '');
        setNotes(first.notes || '');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load weekly reviews');
    } finally {
      setLoading(false);
    }
  }, [activeReview]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateNewReview = async () => {
    try {
      const created = await createWeeklyReview({
        wins: '',
        challenges: '',
        lessons: '',
        nextFocus: '',
      });
      setActiveReview(created);
      setWins('');
      setChallenges('');
      setLessons('');
      setNextFocus('');
      setNotes('');
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create review');
    }
  };

  const handleSelectReview = (rev: WeeklyReviewDto) => {
    setActiveReview(rev);
    setWins(rev.wins || '');
    setChallenges(rev.challenges || '');
    setLessons(rev.lessons || '');
    setNextFocus(rev.nextFocus || '');
    setNotes(rev.notes || '');
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    try {
      const updated = await updateWeeklyReview(activeReview.id, {
        wins: wins.trim() || null,
        challenges: challenges.trim() || null,
        lessons: lessons.trim() || null,
        nextFocus: nextFocus.trim() || null,
        notes: notes.trim() || null,
      });
      setActiveReview(updated);
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save review');
    }
  };

  const handleToggleStatus = async () => {
    if (!activeReview) return;
    try {
      let updated: WeeklyReviewDto;
      if (activeReview.status === 'DRAFT') {
        updated = await completeWeeklyReview(activeReview.id);
      } else {
        updated = await reopenWeeklyReview(activeReview.id);
      }
      setActiveReview(updated);
      void loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update review status');
    }
  };

  return (
    <div className="space-y-6" id="weekly-review-page">
      <PageHeader
        title="Weekly Review & Strategic Retrospective"
        description="Review evidence, execution, learning, constraints, and decisions from the week."
        breadcrumbs={[{ label: 'Proof' }, { label: 'Weekly Review' }]}
        actions={
          <button
            onClick={() => { void handleCreateNewReview(); }}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
          >
            + Start Weekly Review
          </button>
        }
      />

      {loading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : error ? (
        <ErrorStateCard message={error} onRetry={() => void loadData()} />
      ) : (
        <>
          {/* Factual Context Summary Banner */}
          {context && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Factual Week In Review ({context.weekStart} to {context.weekEnd})
                  </h2>
                  <p className="text-xs text-slate-500">Deterministic system aggregates from your execution logs</p>
                </div>
                <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Factual Record
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Completed Tasks</p>
                  <p className="text-xl font-bold text-[#22C55E]">{context.completedTasks}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Blocked Tasks</p>
                  <p className="text-xl font-bold text-[#FF5A00]">{context.blockedTasks}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">Planned Hours</p>
                  <p className="text-xl font-bold text-slate-900">{Math.round(context.plannedMinutes / 60)}h</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider">Learning Hours</p>
                  <p className="text-xl font-bold text-[#A855F7]">{Math.round(context.learningMinutes / 60)}h</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#3AB1EC] uppercase tracking-wider">Evidence Added</p>
                  <p className="text-xl font-bold text-[#3AB1EC]">{context.evidenceCreated}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
                  <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-wider">Active Projects</p>
                  <p className="text-xl font-bold text-slate-900">{context.activeProjects}</p>
                </div>
              </div>

              {/* Planned vs Actual Distinction Statement */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span>Core Metric Logic: <strong>Task Estimate ≠ Scheduled Time ≠ Actual Time</strong></span>
                <span className="font-semibold text-slate-700">Factual Non-Gamified Log</span>
              </div>
            </div>
          )}

          {/* Main Grid: Review History + Reflection Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Review Log History */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                Weekly Review Log
              </h3>

              {reviews.length === 0 ? (
                <div className="p-6 text-center bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                  <p className="text-slate-800 text-sm font-semibold">No reviews logged yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Start a weekly review to capture human reflection.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    onClick={() => handleSelectReview(rev)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                      activeReview?.id === rev.id
                        ? 'bg-blue-50/60 border-[#3B82F6] ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">
                        Review: {rev.createdAt.split('T')[0]}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                          rev.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-[#22C55E] border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    {rev.wins && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-1 leading-relaxed">
                        Wins: {rev.wins}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Col: Review Reflection Editor */}
            <div className="lg:col-span-2">
              {activeReview ? (
                <form onSubmit={(e) => { void handleSaveReview(e); }} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Structured Human Reflection</h3>
                      <p className="text-xs text-slate-500">Created: {activeReview.createdAt.split('T')[0]}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => { void handleToggleStatus(); }}
                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors text-center ${
                          activeReview.status === 'COMPLETED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-[#22C55E] text-white border-emerald-600 hover:bg-emerald-600'
                        }`}
                      >
                        {activeReview.status === 'COMPLETED' ? 'Reopen Review' : 'Mark Completed'}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Decision Option */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Strategic Review Decision</label>
                    <div className="flex flex-wrap gap-2">
                      {(['CONTINUE', 'ADJUST', 'DEFER', 'STOP', 'INVESTIGATE'] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDecision(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            decision === d
                              ? 'bg-[#3B82F6] text-white border-blue-600 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reflection Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        1. What moved forward this week? (Wins & Accomplishments)
                      </label>
                      <textarea
                        value={wins}
                        onChange={(e) => setWins(e.target.value)}
                        rows={3}
                        placeholder="Key milestones completed, code shipped, pull requests merged..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        2. What was blocked or constrained? (Challenges & Friction)
                      </label>
                      <textarea
                        value={challenges}
                        onChange={(e) => setChallenges(e.target.value)}
                        rows={3}
                        placeholder="Bottlenecks, unexpected capacity drain, unresolved dependencies..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        3. What did I learn? (Insights & Key Takeaways)
                      </label>
                      <textarea
                        value={lessons}
                        onChange={(e) => setLessons(e.target.value)}
                        rows={3}
                        placeholder="Technical learnings, architectural discoveries, process insights..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        4. Strategic Focus for Next Week
                      </label>
                      <textarea
                        value={nextFocus}
                        onChange={(e) => setNextFocus(e.target.value)}
                        rows={3}
                        placeholder="Primary focus items, upcoming milestones, major target deliverables..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-xs">
                  Select a review from the history sidebar or create a new review to edit reflections.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
