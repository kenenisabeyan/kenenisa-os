import React from 'react';
import { useNavigate } from 'react-router-dom';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const actions = [
    {
      title: 'Task',
      subtitle: 'Create a new executable task with P0-P3 priority',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h2a2 2 0 002 2m-6 9l2 2 4-4" />
        </svg>
      ),
      bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      path: '/app/tasks',
    },
    {
      title: 'Project',
      subtitle: 'Start an active engineering or career project',
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      bg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
      path: '/app/projects',
    },
    {
      title: 'Plan Outcome',
      subtitle: 'Set a target outcome for Year, Month, Week, or Day',
      icon: (
        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bg: 'bg-cyan-50 border-cyan-200 hover:border-cyan-400',
      path: '/app/planning',
    },
    {
      title: 'Time Block',
      subtitle: 'Allocate dedicated execution focus hours on your schedule',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
      path: '/app/planning',
    },
    {
      title: 'Evidence',
      subtitle: 'Attach Git commits, test passes, logs, or external proof',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      path: '/app/evidence',
    },
    {
      title: 'Learning Item',
      subtitle: 'Record domain study, paper notes, or technical skill practice',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
      path: '/app/learning',
    },
    {
      title: 'Opportunity',
      subtitle: 'Track career targets, roles, contacts, or milestone applications',
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bg: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      path: '/app/opportunities',
    },
    {
      title: 'Results & Excel',
      subtitle: 'Inspect factual results, trend analysis, or download Excel reports',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: 'bg-teal-50 border-teal-200 hover:border-teal-400',
      path: '/app/results',
    },
  ];

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] flex flex-col overflow-hidden transform transition-all">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-600" />
              Global Quick Action
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">Select work item or execution record to create or manage</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {actions.map((act) => (
            <button
              key={act.title}
              onClick={() => handleSelect(act.path)}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all shadow-xs group cursor-pointer ${act.bg}`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0 group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  {act.title}
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5">{act.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>Keyboard shortcut: <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700">Ctrl + Shift + N</kbd></span>
          <span className="font-semibold text-blue-700">KENENISA OS Personal Engine</span>
        </div>
      </div>
    </div>
  );
};
