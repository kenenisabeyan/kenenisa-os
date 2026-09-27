import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.js';
import { MobileNav, MobileBottomBar } from './MobileNav.js';
import { ErrorBoundary } from '../common/ErrorBoundary.js';
import { QuickActionModal } from '../ui/QuickActionModal.js';
import { GlobalSearchModal } from '../ui/GlobalSearchModal.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setQuickActionOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-screen sticky top-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile Nav Drawer */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Global Desktop & Mobile Top Header Bar */}
        <header className="h-16 bg-white/90 border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md shadow-2xs">
          {/* Mobile Left: Menu Toggle + Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/logo-icon.jpg"
                alt="KENENISA OS"
                className="w-7 h-7 rounded-lg object-cover shadow-xs ring-1 ring-cyan-400/30"
              />
              <span className="font-black text-xs text-slate-900 tracking-tight">KENENISA OS</span>
            </div>
          </div>

          {/* Desktop Left: Global Search Input Trigger */}
          <div className="hidden lg:flex items-center flex-1 max-w-md">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/90 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-semibold text-slate-500">Search tasks, projects, plans, evidence...</span>
              </div>
              <kbd className="px-2 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-500 shadow-2xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>System Operational</span>
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              title="Global Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* + New Quick Action Button */}
            <button
              id="global-quick-action-btn"
              onClick={() => setQuickActionOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ New</span>
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Mobile Bottom Bar */}
        <MobileBottomBar />

        {/* Global Modals */}
        <QuickActionModal isOpen={quickActionOpen} onClose={() => setQuickActionOpen(false)} />
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </div>
  );
};


