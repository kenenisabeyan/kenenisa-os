import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div className="relative flex-1 max-w-xs w-72 bg-white h-[100dvh] shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="absolute top-3.5 right-3.5 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Sidebar onCloseMobile={onClose} />
      </div>
    </div>
  );
};

interface MobileBottomBarProps {
  onOpenMenu?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenMenu }) => {
  const primaryLinks = [
    { label: 'Today', path: '/app/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Tasks', path: '/app/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Planning', path: '/app/planning', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Results', path: '/app/results', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200/90 backdrop-blur-md z-40 flex items-center justify-around px-1 select-none shadow-lg h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]"
    >
      {primaryLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          aria-label={link.label}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-semibold transition-all ${
              isActive
                ? 'text-[#2563eb] font-bold bg-blue-50/80 border border-blue-200/70 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <svg className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#2563eb]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
              <span>{link.label}</span>
            </>
          )}
        </NavLink>
      ))}

      {onOpenMenu && (
        <button
          onClick={onOpenMenu}
          aria-label="Open Full Menu"
          className="flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 px-1 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 transition-all cursor-pointer"
        >
          <svg className="w-5 h-5 mb-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>Menu</span>
        </button>
      )}
    </nav>
  );
};


