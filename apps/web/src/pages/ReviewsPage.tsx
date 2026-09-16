import { useState, useEffect, useCallback } from 'react';
import {
  fetchWeeklyReviews,
  fetchWeeklyReviewContext,
  createWeeklyReview,
  updateWeeklyReview,
  completeWeeklyReview,
  reopenWeeklyReview,
} from '../features/reviews/api.js';
import type { WeeklyReviewDto, WeeklyReviewContextDto } from '@kenenisa-os/shared';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<WeeklyReviewDto[]>([]);
  const [activeReview, setActiveReview] = useState<WeeklyReviewDto | null>(null);
  const [context, setContext] = useState<WeeklyReviewContextDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [lessons, setLessons] = useState('');
  const [nextFocus, setNextFocus] = useState('');
  const [notes, setNotes] = useState('');

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
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Engineering Feedback & Weekly Reviews</h1>
          <p className="text-sm text-slate-500">
            Structured reflective review loop: evaluate outcomes, challenges, and lessons learned.
          </p>
        </div>
        <button
          onClick={() => { void handleCreateNewReview(); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs"
        >
          + Start Weekly Review
        </button>
      </div>

      {/* Factual Context Banner ("This Week in Numbers") */}
      {context && (
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-900">Factual Summary ({context.weekStart} to {context.weekEnd})</span>
            <span>Deterministic System Aggregates</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Completed Tasks</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">{context.completedTasks}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Blocked Tasks</p>
              <p className="text-xl font-bold text-rose-600 mt-0.5">{context.blockedTasks}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Planned Hours</p>
              <p className="text-xl font-bold text-sky-600 mt-0.5">{Math.round(context.plannedMinutes / 60)}h</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Learning Hours</p>
              <p className="text-xl font-bold text-purple-600 mt-0.5">{Math.round(context.learningMinutes / 60)}h</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Evidence Records</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">{context.evidenceCreated}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[11px] font-medium text-slate-500">Active Projects</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{context.activeProjects}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid: History Sidebar + Review Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Review History */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Review History</h2>
          {loading ? (
            <div className="p-4 text-center text-slate-400">Loading reviews...</div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="p-6 text-center bg-white border border-slate-200/90 rounded-xl shadow-xs">
              <p className="text-slate-800 text-sm font-medium">No reviews logged yet.</p>
              <p className="text-xs text-slate-500 mt-1">Start a weekly review to capture reflection.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => handleSelectReview(rev)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeReview?.id === rev.id
                    ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-900">
                    Review: {rev.createdAt.split('T')[0]}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                      rev.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
                {rev.wins && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-1">Wins: {rev.wins}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Column: Review Editor */}
        <div className="lg:col-span-2">
          {activeReview ? (
            <form onSubmit={(e) => { void handleSaveReview(e); }} className="bg-white border border-slate-200/90 rounded-xl p-6 space-y-5 shadow-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Weekly Reflection Editor</h2>
                  <p className="text-xs text-slate-500">Created: {activeReview.createdAt.split('T')[0]}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { void handleToggleStatus(); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      activeReview.status === 'COMPLETED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {activeReview.status === 'COMPLETED' ? 'Reopen Review' : 'Mark Completed'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-700 mb-1">
                    🏆 Key Wins & Accomplishments
                  </label>
                  <textarea
                    rows={3}
                    value={wins}
                    onChange={(e) => setWins(e.target.value)}
                    placeholder="What went exceptionally well this week?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    ⚠️ Challenges & Friction Points
                  </label>
                  <textarea
                    rows={3}
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="What blocked progress, caused delay, or went wrong?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-700 mb-1">
                    💡 Key Engineering Lessons
                  </label>
                  <textarea
                    rows={3}
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    placeholder="What insights or technical lessons were learned?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sky-700 mb-1">
                    🎯 Next Week Focus & Adjustments
                  </label>
                  <textarea
                    rows={3}
                    value={nextFocus}
                    onChange={(e) => setNextFocus(e.target.value)}
                    placeholder="What is the main priority for next week?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200/90 rounded-xl text-slate-500 text-xs shadow-xs">
              Select or start a weekly review to enter reflection mode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
