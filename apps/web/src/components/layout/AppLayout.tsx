import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar.js';
import { MobileNav, MobileBottomBar } from './MobileNav.js';
import { ErrorBoundary } from '../common/ErrorBoundary.js';
import { QuickActionModal } from '../ui/QuickActionModal.js';
import { GlobalSearchModal } from '../ui/GlobalSearchModal.js';
import { PerformanceInspectorModal } from '../performance/PerformanceInspectorModal.js';
import { ZapIcon } from '../common/ZapIcon.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [perfModalOpen, setPerfModalOpen] = useState(false);

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
      {/* Fixed Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 z-40 bg-white">
        <Sidebar />
      </div>

      {/* Spacer to prevent main layout from sliding under the fixed sidebar */}
      <div className="hidden lg:block w-64 shrink-0" aria-hidden="true" />

      {/* Mobile Nav Drawer */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Global Desktop & Mobile Top Header Bar - Fixed Position */}
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white/90 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between z-30 backdrop-blur-md shadow-xs transition-all duration-300">
          {/* Mobile Left: Menu Toggle + Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-sm bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200/90 transition-all cursor-pointer"
              aria-label="Open navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden shadow-xs ring-1 ring-cyan-400/40">
                <img
                  src="/logo-icon.jpg"
                  alt="KENENISA OS"
                  className="w-full h-full object-cover aspect-square rounded-full"
                />
              </div>
              <span className="font-black text-xs text-slate-900 tracking-tight">KENENISA OS</span>
            </div>
          </div>

          {/* Desktop Left: Global Search Input Trigger */}
          <div className="hidden lg:flex items-center flex-1 max-w-md">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full bg-slate-100/80 hover:bg-white hover:border-blue-300/80 border border-slate-200/80 rounded-sm px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 transition-all group shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Search tasks, projects, plans, evidence...</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-white group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-200 rounded-md font-mono text-[10px] font-bold text-slate-500 group-hover:text-blue-700 shadow-2xs transition-colors">
                  Ctrl + K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* System Status & Microsecond Telemetry Trigger */}
            <button
              onClick={() => setPerfModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs transition-all cursor-pointer"
              title="Click to view live microsecond performance telemetry"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>System Operational</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-mono text-emerald-700 border border-emerald-300 inline-flex items-center gap-1">
                <ZapIcon className="w-2.5 h-2.5 text-amber-500" /> µs
              </span>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="lg:hidden p-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Global Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* AI Copilot Quick Trigger (Prominent on Mobile & Desktop) */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-copilot'))}
              className="p-2 sm:px-3 sm:py-2 rounded-sm bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/90 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Open AI Command Copilot"
              aria-label="Open AI Command Copilot"
            >
              <span className="text-blue-600 text-sm">✦</span>
              <span className="font-bold">AI</span>
            </button>

            {/* + New Quick Action Button */}
            <button
              id="global-quick-action-btn"
              onClick={() => setQuickActionOpen(true)}
              className="px-4 py-2 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ New</span>
            </button>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div className="h-16 shrink-0" aria-hidden="true" />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-32 sm:pb-28 lg:pb-8 min-w-0 overflow-x-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Mobile Bottom Bar */}
        <MobileBottomBar onOpenMenu={() => setMobileOpen(true)} />

        {/* Global Modals */}
        <QuickActionModal isOpen={quickActionOpen} onClose={() => setQuickActionOpen(false)} />
        <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        <PerformanceInspectorModal isOpen={perfModalOpen} onClose={() => setPerfModalOpen(false)} />
      </div>
    </div>
  );
};


