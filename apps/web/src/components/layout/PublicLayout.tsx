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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#3B82F6]/20 selection:text-slate-900">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center px-4 sm:px-8 justify-between shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20 text-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-[#3B82F6] transition-colors">
              KENENISA OS
            </span>
            <span className="text-[9px] text-[#3B82F6] font-extrabold tracking-widest uppercase">
              Engineering OS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Public Navigation" className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-100 text-[#3B82F6] font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              Open Operating System →
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200/90 z-30 p-4 shadow-lg space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive ? 'bg-blue-50 text-[#3B82F6] font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}

      {/* Main Public Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-16">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200/90 py-12 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] flex items-center justify-center font-bold text-white text-xs">
                K
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">KENENISA OS</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              A Personal Engineering & Career Operating System designed to transform goals, projects, learning, and proof into an integrated system of execution.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs font-semibold text-slate-600">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Product</span>
              <ul className="space-y-1.5">
                <li><Link to="/" className="hover:text-[#3B82F6] transition-colors">Home</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#3B82F6] transition-colors">How It Works</Link></li>
                <li><Link to="/capabilities" className="hover:text-[#3B82F6] transition-colors">Capabilities</Link></li>
                <li><Link to="/about" className="hover:text-[#3B82F6] transition-colors">About</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Access</span>
              <ul className="space-y-1.5">
                <li><Link to="/login" className="hover:text-[#3B82F6] transition-colors">Sign In</Link></li>
                <li><Link to="/login" className="hover:text-[#3B82F6] transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-3">
          <span>&copy; {new Date().getFullYear()} KENENISA OS &bull; Personal Engineering Operating System</span>
          <span>Factual &bull; Non-Gamified &bull; Evidence-Backed</span>
        </div>
      </footer>
    </div>
  );
};
