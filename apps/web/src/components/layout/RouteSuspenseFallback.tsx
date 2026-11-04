import React from 'react';

export const RouteSuspenseFallback: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-1" aria-busy="true" aria-label="Loading page content">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-slate-100 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-8 w-14 bg-slate-200 rounded-lg" />
            <div className="h-2.5 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="h-5 w-40 bg-slate-200 rounded-md" />
        <div className="space-y-3 pt-2">
          <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl" />
          <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl" />
          <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

