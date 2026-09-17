import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { MobileNav, MobileBottomBar } from './MobileNav.js';
import { ErrorBoundary } from '../common/ErrorBoundary.js';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {/* Mobile Header */}
        <header className="h-14 lg:hidden bg-white/95 border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
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
                className="w-7 h-7 rounded-lg object-cover shadow-sm ring-1 ring-cyan-400/30"
              />
              <span className="font-black text-sm text-slate-900 tracking-tight">KENENISA OS</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Mobile Bottom Bar */}
        <MobileBottomBar />
      </div>
    </div>
  );
};

