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
      { label: 'Executive Overview', path: '/app/executive' },
      { label: 'Work Intelligence', path: '/app/work-intelligence' },
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
      { label: 'Weekly Review', path: '/app/reviews' },
    ],
  },
  {
    title: 'GROW',
    items: [
      { label: 'Analytics', path: '/app/analytics' },
      { label: 'Career Hub', path: '/app/career' },
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
      className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-full select-none shadow-sm"
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200/90 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900">KENENISA OS</span>
            <span className="text-[10px] text-[#3B82F6] font-extrabold tracking-wider uppercase">Engineering OS</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav aria-label="Sidebar Navigation Sections" className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar bg-white">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 select-none">
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
                      ? 'bg-blue-50 text-[#2563eb] border border-blue-200/80 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-[#A855F7]/15 text-[#7e22ce] border border-[#A855F7]/30 uppercase tracking-wide">
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
      <div className="p-3 border-t border-slate-200/90 bg-slate-50/80 shrink-0">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800">
                {(user?.displayName || 'K')[0]}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-white" title="System Connected" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 truncate">{user?.displayName || 'Kenenisa'}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email || 'owner@kenenisa.os'}</span>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            title="Logout"
            aria-label="Logout of Kenenisa OS"
            className="p-2 rounded-lg bg-slate-200/70 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors shrink-0 border border-slate-200"
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


