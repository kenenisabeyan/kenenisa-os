import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth.js';

export interface NavSection {
  title: string;
  items: {
    label: string;
    path: string;
    badge?: string;
  }[];
}

export const navSections: NavSection[] = [
  {
    title: 'COMMAND CENTER',
    items: [
      { label: 'Command Center', path: '/app/dashboard' },
      { label: 'Tasks', path: '/app/tasks' },
      { label: 'Planning', path: '/app/planning' },
    ],
  },
  {
    title: 'BUILD',
    items: [
      { label: 'Workstreams', path: '/app/workstreams' },
      { label: 'Goals', path: '/app/goals' },
      { label: 'Projects', path: '/app/projects' },
      { label: 'Milestones', path: '/app/milestones' },
    ],
  },
  {
    title: 'DEVELOP',
    items: [
      { label: 'Learning', path: '/app/learning' },
      { label: 'Skills', path: '/app/skills' },
    ],
  },
  {
    title: 'PROOF',
    items: [
      { label: 'Evidence', path: '/app/evidence' },
      { label: 'Reviews', path: '/app/reviews' },
    ],
  },
  {
    title: 'GROW',
    items: [
      { label: 'Analytics', path: '/app/analytics' },
      { label: 'Opportunities', path: '/app/opportunities' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Mentor', path: '/app/intelligence', badge: 'AI' },
    ],
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside
      aria-label="Main Navigation"
      className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full select-none shadow-xl"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-500/20 text-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white">KENENISA OS</span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Engineering OS</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav aria-label="Sidebar Navigation Sections" className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 select-none">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/5'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wide">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                {(user?.displayName || 'K')[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" title="System Connected" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || 'Kenenisa'}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email || 'owner@kenenisa.os'}</span>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            title="Logout"
            aria-label="Logout of Kenenisa OS"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

