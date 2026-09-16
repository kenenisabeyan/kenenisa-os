import React from 'react';

export type BadgeVariant =
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REVIEW'
  | 'DONE'
  | 'CANCELLED'
  | 'URGENT'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'NEUTRAL'
  | 'INFO';

interface BadgeProps {
  variant: string;
  label?: string;
  className?: string;
}

const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
  READY: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  IN_PROGRESS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  BLOCKED: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  REVIEW: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  DONE: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  CANCELLED: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },

  URGENT: { bg: 'bg-rose-500/15', text: 'text-rose-400 font-bold', border: 'border-rose-500/30' },
  HIGH: { bg: 'bg-amber-500/15', text: 'text-amber-400 font-semibold', border: 'border-amber-500/30' },
  MEDIUM: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  LOW: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },

  NEUTRAL: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
  INFO: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, className = '' }) => {
  const normalizedVariant = (variant || 'NEUTRAL').toUpperCase();
  const style = variantStyles[normalizedVariant] || variantStyles.NEUTRAL;
  const displayText = label || variant.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {displayText}
    </span>
  );
};
