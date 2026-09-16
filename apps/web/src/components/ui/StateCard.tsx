import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 3,
  height = 'h-16',
  className = '',
}) => {
  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`} aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`w-full bg-slate-900/60 border border-slate-800/60 rounded-xl ${height}`} />
      ))}
    </div>
  );
};

interface EmptyStateCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl text-center ${className}`}
    >
      {icon ? (
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition-all duration-150 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface ErrorStateCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorStateCard: React.FC<ErrorStateCardProps> = ({
  title = 'Failed to load content',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-center ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h4 className="text-sm font-semibold text-rose-300 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all duration-150"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
