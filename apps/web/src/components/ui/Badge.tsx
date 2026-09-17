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
  READY: { bg: 'bg-[#3AB1EC]/15', text: 'text-[#0284c7] font-semibold', border: 'border-[#3AB1EC]/35' },
  IN_PROGRESS: { bg: 'bg-[#3B82F6]/15', text: 'text-[#1d4ed8] font-semibold', border: 'border-[#3B82F6]/35' },
  BLOCKED: { bg: 'bg-[#FF5A00]/15', text: 'text-[#c2410c] font-bold', border: 'border-[#FF5A00]/35' },
  REVIEW: { bg: 'bg-[#6366F1]/15', text: 'text-[#4338ca] font-semibold', border: 'border-[#6366F1]/35' },
  DONE: { bg: 'bg-[#22C55E]/15', text: 'text-[#15803d] font-semibold', border: 'border-[#22C55E]/35' },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },

  AI: { bg: 'bg-[#A855F7]/15', text: 'text-[#7e22ce] font-bold', border: 'border-[#A855F7]/35' },
  INTELLIGENCE: { bg: 'bg-[#A855F7]/15', text: 'text-[#7e22ce] font-bold', border: 'border-[#A855F7]/35' },
  GOLD: { bg: 'bg-[#FFD700]/20', text: 'text-[#92400e] font-extrabold', border: 'border-[#FFD700]/50' },
  MILESTONE: { bg: 'bg-[#FFD700]/20', text: 'text-[#92400e] font-extrabold', border: 'border-[#FFD700]/50' },

  URGENT: { bg: 'bg-rose-100', text: 'text-rose-800 font-bold', border: 'border-rose-300' },
  HIGH: { bg: 'bg-[#FF5A00]/15', text: 'text-[#c2410c] font-bold', border: 'border-[#FF5A00]/35' },
  MEDIUM: { bg: 'bg-[#3AB1EC]/15', text: 'text-[#0284c7] font-semibold', border: 'border-[#3AB1EC]/35' },
  LOW: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },

  NEUTRAL: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  INFO: { bg: 'bg-[#3AB1EC]/15', text: 'text-[#0284c7] font-semibold', border: 'border-[#3AB1EC]/35' },
};


export const Badge: React.FC<BadgeProps> = ({ variant, label, className = '' }) => {
  const normalizedVariant = (variant || 'NEUTRAL').toUpperCase();
  const style = variantStyles[normalizedVariant] || variantStyles.NEUTRAL;
  const displayText = label || variant.replace(/_/g, ' ');

  const showDot = ['READY', 'IN_PROGRESS', 'BLOCKED', 'AI', 'MILESTONE', 'URGENT'].includes(normalizedVariant);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-2xs backdrop-blur-md transition-all duration-200 ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      <span>{displayText}</span>
    </span>
  );
};
