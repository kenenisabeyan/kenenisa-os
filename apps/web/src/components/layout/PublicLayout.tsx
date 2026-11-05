import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth.js';

interface PublicLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  hasSubmenu?: boolean;
  subLinks?: { label: string; path: string }[];
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll position for dynamic header visibility, background & horizontal progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 30);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100));
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer or modal is open
  useEffect(() => {
    if (drawerOpen || contactModalOpen || cvModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, contactModalOpen, cvModalOpen]);

  // Center desktop header links that appear smoothly only when scrolling starts
  const headerNavLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'CAPABILITIES', path: '/capabilities' },
    { label: 'HOW IT WORKS', path: '/how-it-works' },
    { label: 'CONTACT', isContact: true },
  ];

  // Drawer menu items matching core Kenenisa OS routes (Home, About, Capabilities, How It Works, Contact)
  const drawerMenuItems: MenuItem[] = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      hasSubmenu: true,
      subLinks: [
        { label: 'System Overview', path: '/' },
        { label: 'Strategic Roadmap', path: '/#roadmap' },
        { label: 'Core Metrics', path: '/#metrics' },
      ],
    },
    {
      id: 'about',
      label: 'About',
      path: '/about',
      hasSubmenu: true,
      subLinks: [
        { label: 'Product Mission & Bio', path: '/about' },
        { label: 'Core Engineering Principles', path: '/about#principles' },
        { label: 'R&D Serpentine Roadmap', path: '/about#roadmap' },
        { label: 'Technology Stack', path: '/about#stack' },
      ],
    },
    {
      id: 'capabilities',
      label: 'Capabilities',
      path: '/capabilities',
      hasSubmenu: true,
      subLinks: [
        { label: 'System Capabilities Matrix', path: '/capabilities' },
        { label: 'Execution Engine (MOD-01)', path: '/capabilities#execution' },
        { label: 'Capacity Planning (MOD-02)', path: '/capabilities#capacity' },
        { label: 'Evidence Vault (MOD-04)', path: '/capabilities#evidence' },
        { label: 'AI Advisory Core (MOD-06)', path: '/capabilities#ai' },
      ],
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      path: '/how-it-works',
      hasSubmenu: true,
      subLinks: [
        { label: 'Methodology Pipeline Flow', path: '/how-it-works' },
        { label: 'Deterministic Execution', path: '/how-it-works#deterministic' },
        { label: 'Observable Proof Vault', path: '/how-it-works#proof' },
        { label: 'Continuous Trajectory & Growth', path: '/how-it-works#growth' },
      ],
    },
    {
      id: 'contact',
      label: 'Contact',
      hasSubmenu: true,
      subLinks: [
        { label: 'Direct Email Briefing', path: 'mailto:beyankenenisa@gmail.com' },
        { label: 'ASTU Engineering Hub', path: '/about' },
        { label: 'Sign In / Account Access', path: '/login' },
      ],
    },
  ];

  const handleItemNavigate = (item: MenuItem) => {
    if (item.id === 'contact') {
      setDrawerOpen(false);
      setContactModalOpen(true);
      return;
    }
    if (item.path) {
      if (item.path.startsWith('mailto:')) {
        window.location.href = item.path;
      } else {
        navigate(item.path);
        setDrawerOpen(false);
      }
    }
  };

  const handleToggleSubmenu = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    if (item.path) {
      return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
    }
    return false;
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#FAFAFA] text-slate-900'} flex flex-col font-sans transition-colors duration-300 selection:bg-[#20B5D6]/20 selection:text-[#0b7994]`}>
      
      {/* ══════════════════════════════════════════════════════════════════════
           STICKY NAVBAR — Dynamic scroll-triggered background and navigation
      ══════════════════════════════════════════════════════════════════════ */}
      {/* Vertical Scroll Progress Bar Indicator — Tracks body scroll progress along viewport right edge */}
      <div
        className={`fixed top-0 right-0 w-[3px] bg-gradient-to-b from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] rounded-b-full transition-all duration-150 z-50 pointer-events-none ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Vertical body scroll progress"
      />

      <header
        className={`fixed top-0 inset-x-0 z-40 h-20 flex items-center px-4 sm:px-8 lg:px-14 justify-between transition-all duration-300 ${
          isScrolled
            ? `${isDark ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-slate-100'} backdrop-blur-xl border-b shadow-xs`
            : 'bg-transparent border-b border-transparent shadow-none'
        }`}
      >
        {/* Horizontal Scroll Progress Bar Indicator — Tracks body scroll progress along header top */}
        <div
          className={`absolute top-0 left-0 h-[3px] bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] rounded-r-full transition-all duration-150 z-50 pointer-events-none ${
            isScrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: `${scrollProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Body scroll progress"
        />

        {/* Author Brand Badge (Left) */}
        <Link to="/" className="flex items-center gap-3 sm:gap-3.5 group" aria-label="Kenenisa Beyan Home">
          <div className="relative shrink-0">
            <img
              src="/kenenisa-avatar.jpg"
              alt="Kenenisa Beyan"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200/90 shadow-sm group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-icon.jpg';
              }}
            />
            {/* Online Status Green Indicator Dot */}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col">
            <span className={`font-black text-sm sm:text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-[#20B5D6] transition-colors leading-tight`}>
              KENENISA
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#20B5D6] font-black tracking-widest uppercase mt-0.5 leading-tight">
              DIRECTOR &amp; DESIGNER
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation (Clean uppercase typography — appears smoothly only on scroll) */}
        <nav
          aria-label="Public Center Navigation"
          className={`hidden lg:flex items-center gap-7 sm:gap-9 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          {headerNavLinks.map((link) => {
            if (link.isContact) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className={`text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer ${
                    contactModalOpen
                      ? 'text-[#20B5D6] font-black'
                      : isDark
                        ? 'text-slate-200 hover:text-[#FE721D]'
                        : 'text-slate-800 hover:text-[#FE721D]'
                  }`}
                >
                  {link.label}
                </button>
              );
            }

            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`);

            return (
              <Link
                key={link.path}
                to={link.path!}
                className={`text-xs font-bold tracking-widest uppercase transition-colors ${
                  isActive
                    ? 'text-[#20B5D6] font-black'
                    : isDark
                      ? 'text-slate-200 hover:text-[#FE721D]'
                      : 'text-slate-800 hover:text-[#FE721D]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Header Right Action Buttons (Theme Toggle & Drawer Hamburger) */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button (Rounded Square with subtle border) */}
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl border ${
              isDark
                ? 'border-slate-700 bg-slate-800/90 text-amber-400 hover:bg-slate-700'
                : isScrolled
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-slate-200/90 bg-white/90 text-slate-700 hover:bg-white backdrop-blur-xs'
            } flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Menu Hamburger Button (Rounded Square with subtle border) */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`w-10 h-10 rounded-xl border ${
              isDark
                ? 'border-slate-700 bg-slate-800/90 text-slate-100 hover:bg-slate-700'
                : isScrolled
                  ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  : 'border-slate-200/90 bg-white/90 text-slate-800 hover:bg-white backdrop-blur-xs'
            } flex items-center justify-center shadow-xs transition-all hover:scale-105 active:scale-95`}
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Direct App / Sign In Link */}
          {user ? (
            <button
              onClick={() => navigate('/app/dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#20B5D6] hover:bg-[#1aa3c2] text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              <span>App</span>
              <span>→</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FE721D] hover:bg-[#e56315] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
           SLIDE-OUT NAVIGATION DRAWER — Exact match to Screenshot 3
      ══════════════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          {/* Heavy Frosted Glass Backdrop Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md sm:backdrop-blur-lg transition-opacity animate-in fade-in duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-In White Drawer Panel from Right */}
          <aside
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 max-w-[88vw] h-full bg-white z-50 shadow-2xl flex flex-col justify-between p-6 sm:p-7 animate-in slide-in-from-right duration-300 ease-out font-sans text-slate-900"
            aria-label="Slide-Out Navigation Drawer"
          >
            {/* Top Close Button */}
            <div className="shrink-0 flex items-center justify-end pb-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-2xl font-light cursor-pointer"
                aria-label="Close Menu"
              >
                ✕
              </button>
            </div>

            {/* Menu Navigation Items with dividers and '+' indicators (Exact match to reference) */}
            <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-0 [scrollbar-width:thin] [-ms-overflow-style:none]">
              {drawerMenuItems.map((item) => {
                const isActive = isItemActive(item);
                const isExpanded = expandedItem === item.id;

                return (
                  <div key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <div
                      onClick={() => handleItemNavigate(item)}
                      className={`w-full py-3 sm:py-3.5 flex items-center justify-between text-left text-base sm:text-lg transition-colors cursor-pointer group ${
                        isActive ? 'text-[#20B5D6] font-semibold' : 'text-slate-800 font-medium hover:text-[#FE721D]'
                      }`}
                    >
                      <span className="tracking-tight select-none">{item.label}</span>
                      {item.hasSubmenu && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleSubmenu(item.id, e)}
                          className={`p-1.5 -mr-1 rounded-md hover:bg-slate-100 text-lg font-light transition-transform duration-200 cursor-pointer ${
                            isActive ? 'text-[#20B5D6] font-normal' : 'text-slate-400 group-hover:text-[#FE721D]'
                          } ${isExpanded ? 'rotate-45' : ''}`}
                          aria-label={`Toggle ${item.label} sub-items`}
                        >
                          +
                        </button>
                      )}
                    </div>

                    {/* Submenu Expansion List */}
                    {item.hasSubmenu && isExpanded && (
                      <div className="pb-3 pl-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.subLinks?.map((sub) => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setDrawerOpen(false)}
                            className="block text-xs font-semibold text-slate-500 hover:text-[#FE721D] py-1 transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Block (CTA Button + CV Resume Link) */}
            <div className="shrink-0 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              {/* Primary Call to Action Button */}
              {user ? (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/app/dashboard');
                  }}
                  className="w-full py-3.5 px-4 bg-[#FE721D] hover:bg-[#e56315] text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>DASHBOARD</span>
                  <span className="text-base font-bold leading-none">↗</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/login');
                  }}
                  className="w-full py-3.5 px-4 bg-[#FE721D] hover:bg-[#e56315] text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <span>SIGN IN</span>
                  <span className="text-base font-bold leading-none">↗</span>
                </button>
              )}

              {/* CV Resume Download Link */}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setCvModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 tracking-widest uppercase transition-colors cursor-pointer"
              >
                <span className="text-base font-medium leading-none">↓</span>
                <span>CV RESUME</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           FLOATING ACTION BUTTON (FAB) — Appears smoothly on scroll
      ══════════════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#FE721D] hover:bg-[#e56315] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group ${
          isScrolled
            ? 'opacity-100 pointer-events-auto translate-y-0 scale-100'
            : 'opacity-0 pointer-events-none translate-y-4 scale-75'
        }`}
        title="Scroll to Top"
        aria-label="Scroll to Top"
      >
        <span className="text-lg font-bold group-hover:-translate-y-0.5 transition-transform">↑</span>
      </button>

      {/* ══════════════════════════════════════════════════════════════════════
           MAIN PUBLIC PAGE CONTENT
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-14 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-16">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
           PUBLIC FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className={`relative ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200/80'} border-t py-14 px-6 sm:px-12 lg:px-16 mt-auto overflow-hidden`}>
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
          <div className="space-y-3 max-w-lg">
            <div className="flex items-center gap-3">
              <img
                src="/kenenisa-avatar.jpg"
                alt="Kenenisa Beyan"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo-icon.jpg';
                }}
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">KENENISA BEYAN</span>
                <span className="text-[10px] text-[#20B5D6] font-black tracking-widest uppercase">
                  DIRECTOR &amp; DESIGNER &bull; ENGINEERING ARCHITECT
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Personal Engineering &amp; Career Operating System designed to turn goals, software architecture, academic milestones, and verifiable proof into a unified discipline.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 text-xs font-bold text-slate-700">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-[#20B5D6] tracking-widest">Navigation</span>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-[#FE721D] transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-[#FE721D] transition-colors">About</Link></li>
                <li><Link to="/capabilities" className="hover:text-[#FE721D] transition-colors">Capabilities</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#FE721D] transition-colors">How It Works</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-[#20B5D6] tracking-widest">Connect</span>
              <ul className="space-y-2">
                <li><a href="mailto:beyankenenisa@gmail.com" className="hover:text-[#FE721D] transition-colors">beyankenenisa@gmail.com</a></li>
                <li><button onClick={() => setCvModalOpen(true)} className="hover:text-[#FE721D] transition-colors text-left">View CV Resume</button></li>
                <li><Link to="/login" className="hover:text-[#FE721D] transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1720px] mx-auto mt-10 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center text-[11px] font-medium text-slate-500 gap-3">
          <span>&copy; {new Date().getFullYear()} KENENISA OS &bull; Personal Engineering Operating System</span>
          <span className="inline-flex items-center gap-1.5 text-[#20B5D6] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6]" />
            Evidence-Backed &bull; Factual &bull; Deterministic
          </span>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════════════════════════
           HIRE ME / CONTACT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setContactModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <img
                  src="/kenenisa-avatar.jpg"
                  alt="Kenenisa Beyan"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo-icon.jpg';
                  }}
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900">Kenenisa Beyan</h3>
                  <p className="text-[10px] font-bold text-[#20B5D6] uppercase tracking-wider">
                    Full-Stack Lead &bull; Software Architect
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 mb-6">
              <p className="leading-relaxed">
                Available for engineering leadership, full-stack systems development, autonomous AI advisory architectures, and high-impact software design.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Email:</span>
                  <a href="mailto:beyankenenisa@gmail.com" className="font-bold text-[#20B5D6] hover:underline">
                    beyankenenisa@gmail.com
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Education:</span>
                  <span className="font-bold text-slate-800">ASTU &bull; Computer Science and Engineering</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available for Contracts &amp; Roles
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:beyankenenisa@gmail.com"
                className="flex-1 py-3 px-4 bg-[#FE721D] hover:bg-[#e56315] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl text-center shadow-md shadow-orange-500/20 transition-all"
              >
                Send Direct Email ↗
              </a>
              <button
                onClick={() => {
                  setContactModalOpen(false);
                  setCvModalOpen(true);
                }}
                className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs tracking-wider uppercase rounded-xl text-center transition-all"
              >
                View CV Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
           CV RESUME MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {cvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setCvModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-[#20B5D6] tracking-widest">
                  Executive Briefing
                </span>
                <h3 className="text-2xl font-black text-slate-900">Kenenisa Beyan — CV &amp; Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Software Engineering Architect &bull; Full-Stack Specialist</p>
              </div>
              <button
                onClick={() => setCvModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-2">
                  Summary
                </h4>
                <p className="leading-relaxed text-slate-600">
                  Disciplined Software Systems Engineer with deep expertise in TypeScript, Node.js, Express, React, PostgreSQL, microsecond-resolution telemetry, deterministic state execution, and grounded AI reasoning architectures.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-2">
                  Academic Background
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">Adama Science and Technology University (ASTU)</div>
                    <div className="text-xs text-slate-500">B.Sc. in Computer Science and Engineering (CSE)</div>
                  </div>
                  <span className="text-xs font-bold text-[#20B5D6] bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                    Graduation Command P0
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-2">
                  Core Technical Capabilities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'TypeScript / JavaScript',
                    'React 19 & Vite',
                    'Node.js & Express.js',
                    'PostgreSQL & Prisma ORM',
                    'Ground-Truth AI Synthesis',
                    'OpenAI & Gemini API',
                    'Microsecond Performance Telemetry',
                    'Vitest & Unit Testing',
                    'System Architecture',
                    'RESTful API Design',
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-black text-slate-900 uppercase text-xs tracking-wider mb-2">
                  Key Production Accomplishment
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900">KENENISA OS — Personal Engineering Operating System</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed and built an end-to-end multi-tier platform with 22+ integrated modules, sub-10ms response times, microsecond performance monitoring, live database grounding, and an Evidence Vault.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-medium">
                Email: beyankenenisa@gmail.com
              </span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#20B5D6] hover:bg-[#1aa3c2] text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
