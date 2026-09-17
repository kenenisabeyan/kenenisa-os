import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth.js';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Capabilities', path: '/capabilities' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#0284C7]/20 selection:text-indigo-950">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-cyan-100/80 h-20 flex items-center px-6 sm:px-12 lg:px-16 justify-between shadow-lg shadow-cyan-500/5 transition-all duration-300">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="KENENISA OS Home">
          <img
            src="/logo-icon.jpg"
            alt="KENENISA OS Logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-xl shadow-cyan-500/25 group-hover:scale-105 group-hover:rotate-2 transition-all duration-300 ring-2 ring-cyan-400/40"
          />
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-indigo-950 group-hover:text-cyan-600 transition-colors leading-tight">
              KENENISA OS
            </span>
            <span className="text-[10px] text-cyan-600 font-extrabold tracking-widest uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              Engineering OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Floating Glass Pill Capsule) */}
        <nav aria-label="Public Navigation" className="hidden md:flex items-center gap-1 bg-slate-100/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 shadow-inner">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-full text-xs font-black transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg shadow-cyan-500/30 scale-102'
                    : 'text-slate-700 hover:text-indigo-950 hover:bg-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <span className="relative z-10 flex items-center gap-1.5">
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  <span>{link.label}</span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-black text-xs shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
            >
              <span>Open Operating System</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full text-xs font-black text-slate-700 hover:text-indigo-950 hover:bg-cyan-50/80 border border-transparent hover:border-cyan-200 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-black text-xs shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 group"
              >
                <span>Get Started</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform text-[10px]">→</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-cyan-100 z-30 p-5 shadow-xl space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 rounded-2xl text-sm font-extrabold transition-all ${
                    isActive ? 'bg-cyan-50 text-[#0284C7] border border-cyan-200' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-[#0284C7] to-[#2563EB] text-white font-extrabold text-xs shadow-md transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Main Public Page Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-16">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="relative bg-gradient-to-br from-sky-100/90 via-indigo-100/60 to-purple-100/80 py-16 px-6 sm:px-12 lg:px-16 mt-auto overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-3.5 group">
              <img
                src="/logo-icon.jpg"
                alt="KENENISA OS Logo"
                className="w-14 h-14 rounded-2xl object-cover shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300 ring-2 ring-cyan-400/40"
              />
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-indigo-950">KENENISA OS</span>
                <span className="text-[10px] text-cyan-800 font-extrabold tracking-widest uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  Personal Engineering OS
                </span>
              </div>
            </div>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
              A Personal Engineering &amp; Career Operating System designed to transform goals, projects, learning, and proof into an integrated system of execution.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 text-sm font-bold text-slate-800">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-cyan-300/80 shadow-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                Product
              </span>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-slate-800 hover:text-cyan-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">Home</Link></li>
                <li><Link to="/how-it-works" className="text-slate-800 hover:text-cyan-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">How It Works</Link></li>
                <li><Link to="/capabilities" className="text-slate-800 hover:text-cyan-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">Capabilities</Link></li>
                <li><Link to="/about" className="text-slate-800 hover:text-cyan-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">About</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-purple-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-purple-300/80 shadow-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Access
              </span>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-slate-800 hover:text-purple-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">Sign In</Link></li>
                <li><Link to="/login" className="text-slate-800 hover:text-purple-700 hover:translate-x-1 transition-all duration-200 inline-block font-extrabold">Get Started</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1720px] mx-auto mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-700 gap-4 relative z-10 bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xs">
          <span>&copy; {new Date().getFullYear()} KENENISA OS &bull; Personal Engineering Operating System</span>
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-md shadow-cyan-500/20">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Factual &bull; Non-Gamified &bull; Evidence-Backed
          </span>
        </div>
      </footer>
    </div>
  );
};
