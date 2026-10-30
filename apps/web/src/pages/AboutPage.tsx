import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

/* ─── Animated Counter Hook ─────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

/* ─── Intersection Observer Hook ────────────────────────────────────────── */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Stat Card Component ────────────────────────────────────────────────── */
const StatCard: React.FC<{ value: number; suffix: string; label: string; icon: string; color: string; border: string; start: boolean }> =
  ({ value, suffix, label, icon, color, border, start }) => {
    const count = useCountUp(value, 1600, start);
    return (
      <div className={`relative bg-white/95 rounded-2xl p-6 border-2 ${border} shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center group overflow-hidden`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} pointer-events-none`} />
        <div className="relative z-10 space-y-1">
          <div className="text-2xl mb-1">{icon}</div>
          <div className="text-4xl font-black text-indigo-950 tracking-tight group-hover:scale-110 transition-transform duration-300">
            {count}{suffix}
          </div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    );
  };

export const AboutPage: React.FC = () => {
  const [activePrinciple, setActivePrinciple] = useState<number | null>(null);
  const { ref: statsRef, inView: statsInView } = useInView(0.4);

  /* ─── R&D Roadmap Steps ─── */
  const rdSteps: RoadmapStep[] = [
    {
      number: '01', badgeTitle: 'PROBLEM DEFINITION', title: 'PINPOINT OPERATIONAL GAPS',
      subtitle: 'Identify Real Friction Before Coding.',
      description: 'We analyze real-world operational fragmentation where academic coursework, engineering code, learning progress, and career opportunities exist in isolated silos.',
      focusAreas: ['Tool fragmentation analysis', 'Academic & engineering workflow audits', 'User pain point & bottleneck mapping', 'Core system objective definition'],
      themeColor: '#6366F1', bgBadgeColor: 'bg-indigo-100 border-indigo-200 text-[#6366F1]', badgeTextColor: 'text-[#6366F1]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      number: '02', badgeTitle: 'ARCHITECTURE', title: 'DESIGN & FORMULATE BLUEPRINTS',
      subtitle: 'Architect Clean Contracts & Data Schemas.',
      description: 'Construct clear information architecture, PostgreSQL schemas, domain service contracts, and UI design systems prior to writing production code.',
      focusAreas: ['Domain model & database schema design', 'REST API & controller specifications', 'Google Roboto design system & UI tokens', 'Deterministic state transition logic'],
      themeColor: '#2563EB', bgBadgeColor: 'bg-blue-100 border-blue-200 text-[#2563EB]', badgeTextColor: 'text-[#2563EB]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
    {
      number: '03', badgeTitle: 'IMPLEMENTATION', title: 'BUILD MODULAR SOFTWARE',
      subtitle: 'Engineering Execution Without Superficial Decoration.',
      description: 'Develop resilient Express services, React SPA pages, state management hooks, and background execution algorithms focused on core system utility.',
      focusAreas: ['TypeScript API & Vite SPA implementation', 'Capacity & daily plan calculation engines', 'Evidence logging & artifact mapping', 'Argon2id auth & session management'],
      themeColor: '#EA580C', bgBadgeColor: 'bg-orange-100 border-orange-200 text-[#EA580C]', badgeTextColor: 'text-[#EA580C]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    },
    {
      number: '04', badgeTitle: 'VERIFICATION', title: 'TEST & COLLECT PROOF',
      subtitle: 'Empirical Proof Before Declaring Success.',
      description: 'Validate every feature using strict Vitest test suites, full TypeScript compilation checks, Vite production builds, and observable runtime evidence.',
      focusAreas: ['Automated API & Web Vitest test coverage', 'Strict tsc type-checking & linting', 'Production bundle optimization & audits', 'Empirical log-based error diagnosis'],
      themeColor: '#16A34A', bgBadgeColor: 'bg-emerald-100 border-emerald-200 text-[#16A34A]', badgeTextColor: 'text-[#16A34A]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      number: '05', badgeTitle: 'EVOLUTION', title: 'EVALUATE & CONTINUOUSLY EVOLVE',
      subtitle: 'Refine Architecture Based on Real Execution Data.',
      description: 'Refine capacity assumptions, upgrade UI components, integrate AI advisory insights, and evolve product capabilities through continuous iterative feedback.',
      focusAreas: ['System state & capacity audit review', 'Intelligence Core AI advisory optimization', 'Component refactoring & design system polish', 'Long-term product roadmap evolution'],
      themeColor: '#9333EA', bgBadgeColor: 'bg-purple-100 border-purple-200 text-[#9333EA]', badgeTextColor: 'text-[#9333EA]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
  ];

  /* ─── Core Principles ─── */
  const principles = [
    {
      icon: '🛠️', title: 'Engineering Before Decoration',
      tagline: 'Utility first. Always.',
      body: 'Focus on solving real operational problems with clean information architecture before adding superficial visual flair or trendy features.',
      detail: 'Every interface element must earn its place by delivering observable value — not aesthetic novelty.',
      color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50/90 border-blue-200/90', hoverText: 'text-blue-700',
      detailBg: 'bg-blue-50/95 border-blue-300',
    },
    {
      icon: '🛡️', title: 'Evidence Before Assumptions',
      tagline: 'Proof or it didn\'t happen.',
      body: 'Decisions and progress claims must be backed by observable proof (commits, test passes, documents, deliverables) rather than arbitrary assertions.',
      detail: 'Assertions without evidence are noise. Verifiable artifacts are the only valid currency of progress.',
      color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50/90 border-emerald-200/90', hoverText: 'text-emerald-700',
      detailBg: 'bg-emerald-50/95 border-emerald-300',
    },
    {
      icon: '⚡', title: 'Simplicity Before Complexity',
      tagline: 'Elegant, not elaborate.',
      body: 'Never introduce complicated workflows or heavy dependencies merely because they are fashionable. Maintain clear, simple execution pathways.',
      detail: 'Complexity is debt. Every abstraction must reduce friction, not add layers of indirection without benefit.',
      color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50/90 border-indigo-200/90', hoverText: 'text-indigo-700',
      detailBg: 'bg-indigo-50/95 border-indigo-300',
    },
    {
      icon: '🤖', title: 'Human Agency Authoritative',
      tagline: 'AI advises. Humans decide.',
      body: 'AI serves strictly as an advisory intelligence layer. The user retains absolute authority over decisions, planning changes, and state mutations.',
      detail: 'The system never auto-mutates user state. Every AI recommendation requires explicit human confirmation before execution.',
      color: 'from-purple-500 to-pink-600', bg: 'bg-purple-50/90 border-purple-200/90', hoverText: 'text-purple-700',
      detailBg: 'bg-purple-50/95 border-purple-300',
    },
  ];

  /* ─── Tech Stack ─── */
  const techStack = [
    { name: 'TypeScript', role: 'Type Safety', badge: 'LANG', color: 'bg-blue-100 border-blue-300 text-blue-900', dot: 'bg-blue-500' },
    { name: 'React + Vite', role: 'SPA Frontend', badge: 'UI', color: 'bg-cyan-100 border-cyan-300 text-cyan-900', dot: 'bg-cyan-500' },
    { name: 'Express.js', role: 'REST API Layer', badge: 'API', color: 'bg-indigo-100 border-indigo-300 text-indigo-900', dot: 'bg-indigo-500' },
    { name: 'PostgreSQL', role: 'Primary Database', badge: 'DB', color: 'bg-sky-100 border-sky-300 text-sky-900', dot: 'bg-sky-500' },
    { name: 'Drizzle ORM', role: 'Schema & Queries', badge: 'ORM', color: 'bg-emerald-100 border-emerald-300 text-emerald-900', dot: 'bg-emerald-500' },
    { name: 'Vitest', role: 'Test Coverage', badge: 'TEST', color: 'bg-amber-100 border-amber-300 text-amber-900', dot: 'bg-amber-500' },
    { name: 'Argon2id', role: 'Auth Security', badge: 'SEC', color: 'bg-red-100 border-red-300 text-red-900', dot: 'bg-red-500' },
    { name: 'Google Gemini', role: 'AI Advisory Core', badge: 'AI', color: 'bg-purple-100 border-purple-300 text-purple-900', dot: 'bg-purple-500' },
  ];

  /* ─── AI Pipeline Steps ─── */
  const aiPipeline = [
    { step: '01', label: 'Database State', desc: 'Live PostgreSQL truth', icon: '🗄️', color: 'bg-blue-100 border-blue-300 text-blue-900' },
    { step: '02', label: 'Context Extraction', desc: 'Structured system snapshot', icon: '🔍', color: 'bg-indigo-100 border-indigo-300 text-indigo-900' },
    { step: '03', label: 'AI Reasoning', desc: 'Gemini advisory analysis', icon: '🤖', color: 'bg-purple-100 border-purple-300 text-purple-900' },
    { step: '04', label: 'Recommendation', desc: 'Actionable next best step', icon: '💡', color: 'bg-amber-100 border-amber-300 text-amber-900' },
    { step: '05', label: 'Human Decision', desc: 'Confirmed by user authority', icon: '✅', color: 'bg-emerald-100 border-emerald-300 text-emerald-900' },
  ];

  return (
    <div className="space-y-24 py-6" id="about-page">

      {/* ══════════════════════════════════════════════════════════════════════
           HERO — Advanced 3D Glass with Floating Metric Badges
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative text-center max-w-[1720px] mx-auto pt-8 overflow-hidden">
        {/* Multi-layer ambient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-blue-400/25 via-indigo-300/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none -z-10" />

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-purple-50/90 border-2 border-blue-200/90 text-blue-900 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:scale-105 transition-all duration-300 mb-8">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <span>Product Philosophy &amp; Mission 🎯</span>
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping opacity-60" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-indigo-950 tracking-tighter leading-[1.05] max-w-5xl mx-auto mb-6">
          Designed to turn{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">ambition</span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-60" />
          </span>{' '}
          into{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 bg-clip-text text-transparent">evidence</span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full opacity-60" />
          </span>.
        </h1>

        <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-semibold mb-12">
          KENENISA OS was created to solve the fundamental problem of modern engineering and career fragmentation: connecting strategic direction, daily execution, verified proof, and long-term trajectory into one disciplined operating system.
        </p>

        {/* Floating Metric Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {[
            { value: '6', label: 'System Modules', icon: '⚡', color: 'bg-blue-50 border-blue-200 text-blue-900' },
            { value: '5', label: 'R&D Phases', icon: '🔬', color: 'bg-indigo-50 border-indigo-200 text-indigo-900' },
            { value: '4', label: 'Core Principles', icon: '💎', color: 'bg-purple-50 border-purple-200 text-purple-900' },
            { value: '100%', label: 'TypeScript', icon: '🛡️', color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
            { value: '0', label: 'Dark Silo Tools', icon: '🚫', color: 'bg-rose-50 border-rose-200 text-rose-900' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 ${m.color} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 backdrop-blur-md`}>
              <span className="text-xl">{m.icon}</span>
              <div className="text-left">
                <div className="text-xl font-black leading-none">{m.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           ANIMATED SYSTEM STATISTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="max-w-[1720px] mx-auto">
        <div className="text-center mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-700 bg-slate-100/90 border border-slate-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            System Architecture at a Glance
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">Built by the Numbers 📊</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard value={6} suffix="+" label="Core Modules" icon="⚡" color="from-blue-500/5 to-indigo-500/10" border="border-blue-200/90" start={statsInView} />
          <StatCard value={5} suffix="" label="R&D Phases" icon="🔬" color="from-indigo-500/5 to-purple-500/10" border="border-indigo-200/90" start={statsInView} />
          <StatCard value={100} suffix="%" label="TypeScript" icon="🛡️" color="from-emerald-500/5 to-teal-500/10" border="border-emerald-200/90" start={statsInView} />
          <StatCard value={4} suffix="" label="Principles" icon="💎" color="from-purple-500/5 to-pink-500/10" border="border-purple-200/90" start={statsInView} />
          <StatCard value={0} suffix="" label="Data Silos" icon="🚫" color="from-rose-500/5 to-orange-500/10" border="border-rose-200/90" start={statsInView} />
          <StatCard value={1} suffix="" label="Unified OS" icon="🎯" color="from-cyan-500/5 to-sky-500/10" border="border-cyan-200/90" start={statsInView} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           THE FRAGMENTATION PROBLEM — 3-column with visual dividers
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/90 border-2 border-blue-200/90 rounded-3xl p-8 sm:p-14 shadow-2xl shadow-blue-500/10 space-y-10 max-w-[1720px] mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-600" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-900 bg-blue-100/90 border border-blue-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Why KENENISA OS Exists
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">The Fragmentation Problem</h2>
          <p className="text-lg text-slate-600 font-semibold max-w-3xl mx-auto">
            Modern practitioners operate across too many disconnected tools. This creates three compounding failures:
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-0 relative z-10">
          {[
            {
              num: '01', icon: '🎯', title: 'High Operational Noise',
              body: 'Academic coursework sits in university portals; software engineering code lives in GitHub; task lists sit in personal todo apps; learning courses stay on tutorial sites; and career opportunities exist in scattered spreadsheets.',
              border: 'border-blue-200/90', badge: 'bg-blue-100 text-blue-800',
            },
            {
              num: '02', icon: '⚡', title: 'Artificial Separation',
              body: 'This fragmentation creates artificial separation between what you intend to do, what you actually work on, and the verifiable proof of what you accomplished.',
              border: 'border-purple-200/90', badge: 'bg-purple-100 text-purple-800',
            },
            {
              num: '03', icon: '🛡️', title: 'Unified OS Is the Fix',
              body: 'KENENISA OS replaces fragmented tools with a single unified operating environment where every action contributes directly to strategic goals and verifiable evidence.',
              border: 'border-emerald-200/90', badge: 'bg-emerald-100 text-emerald-800',
            },
          ].map((card, i) => (
            <div key={i} className={`relative bg-white/95 border-2 ${card.border} p-6 sm:p-8 space-y-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden rounded-2xl lg:rounded-none ${i === 0 ? 'lg:rounded-l-2xl' : ''} ${i === 2 ? 'lg:rounded-r-2xl' : ''} ${i === 1 ? 'lg:border-l-0 lg:border-r-0' : ''}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${card.badge} uppercase tracking-widest`}>
                  {card.num}
                </span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <h4 className="text-xl font-black text-indigo-950 group-hover:text-blue-700 transition-colors">{card.title}</h4>
              <p className="text-slate-700 leading-relaxed font-semibold text-sm">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           INTERACTIVE CORE PRINCIPLES — Expand on click
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-10 max-w-[1720px] mx-auto">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-indigo-900 bg-indigo-100/90 border border-indigo-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Core Principles
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">Product Philosophy 💎</h2>
          <p className="text-slate-600 font-semibold text-lg">Click any principle to expand its engineering rationale.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {principles.map((p, i) => {
            const isActive = activePrinciple === i;
            return (
              <div
                key={i}
                onClick={() => setActivePrinciple(isActive ? null : i)}
                className={`relative bg-white/95 border-2 rounded-3xl p-7 space-y-4 shadow-md cursor-pointer overflow-hidden transition-all duration-500 group
                  ${isActive ? 'border-indigo-400/90 shadow-2xl shadow-indigo-500/20 scale-[1.02]' : 'border-slate-200/80 hover:shadow-xl hover:-translate-y-1.5 hover:border-indigo-300/80'}`}
              >
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${p.color} transition-all duration-300`} />

                {/* Active ring glow */}
                {isActive && <div className="absolute inset-0 rounded-3xl ring-2 ring-indigo-400/40 pointer-events-none" />}

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {p.icon}
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{p.tagline}</div>
                  <h3 className={`text-lg font-black text-indigo-950 transition-colors duration-300 ${isActive ? p.hoverText : `group-hover:${p.hoverText}`}`}>
                    {p.title}
                  </h3>
                </div>

                <p className="text-slate-700 leading-relaxed font-semibold text-sm">{p.body}</p>

                {/* Expanded detail */}
                <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`mt-2 p-4 rounded-2xl border-2 ${p.detailBg} space-y-1`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engineering Rationale</div>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{p.detail}</p>
                  </div>
                </div>

                {/* Expand indicator */}
                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                  <span className={`inline-block transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`}>▶</span>
                  {isActive ? 'Collapse' : 'Expand Rationale'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           ENGINEERING R&D ROADMAP
      ══════════════════════════════════════════════════════════════════════ */}
      <section>
        <SerpentineRoadmap
          title="Engineering R&D Methodology Roadmap"
          subtitle="How features and system methodologies in KENENISA OS are designed, tested, verified, and established."
          badgeText="R&D PROCESS & METHODOLOGY"
          summaryBadgeText="FIVE PHASES"
          summaryTitle="FROM HYPOTHESIS TO ESTABLISHED PROOF"
          summaryDescription="Our product development follows strict scientific and software engineering principles to ensure every feature delivers genuine utility without unnecessary complexity."
          summaryMetaText="KENENISA OS • R&D BLUEPRINT"
          steps={rdSteps}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           TECH STACK SHOWCASE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-slate-50/90 via-blue-50/60 to-indigo-50/90 border-2 border-slate-200/90 rounded-3xl p-8 sm:p-14 shadow-2xl shadow-slate-300/30 space-y-10 max-w-[1720px] mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-500" />

        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-700 bg-slate-100/90 border border-slate-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            Technology Foundation
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">Engineering Stack 🔧</h2>
          <p className="text-slate-600 font-semibold text-lg max-w-2xl mx-auto">
            Production-grade technologies chosen for reliability, type-safety, and real engineering precision.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {techStack.map((tech, i) => (
            <div key={i} className={`relative border-2 ${tech.color} rounded-2xl p-4 text-center space-y-2.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
              <div className={`w-2 h-2 rounded-full ${tech.dot} mx-auto animate-pulse`} />
              <div className="text-[9px] font-black uppercase tracking-widest opacity-60">{tech.badge}</div>
              <div className="font-black text-sm leading-tight">{tech.name}</div>
              <div className="text-[10px] font-semibold opacity-70 leading-snug">{tech.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           AI ADVISORY PIPELINE — Advanced Visual Diagram
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-purple-50/90 via-indigo-50/80 to-blue-50/90 border-2 border-purple-200/90 rounded-3xl p-8 sm:p-14 shadow-xl shadow-purple-500/10 space-y-10 max-w-[1720px] mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-purple-900 bg-purple-100/90 border border-purple-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            Human + AI Advisory Collaboration
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">AI Intelligence Pipeline 🤖</h2>
          <p className="text-slate-700 font-semibold text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            AI should increase clarity, not remove human agency. Intelligence is strictly downstream of real system data in KENENISA OS.
          </p>
          <div className="inline-flex items-center gap-1.5 bg-purple-100/90 border-2 border-purple-300 px-4 py-1.5 rounded-full text-xs font-black text-purple-900 uppercase tracking-wider shadow-xs mt-1">
            Clear Boundary ⚡ Enforced
          </div>
        </div>

        {/* Pipeline diagram */}
        <div className="bg-white/95 rounded-2xl border-2 border-indigo-200/90 shadow-md p-5 sm:p-8">
          {/* Mobile Vertical Flow (< sm) */}
          <div className="sm:hidden flex flex-col gap-2.5">
            {aiPipeline.map((step, i) => (
              <React.Fragment key={i}>
                <div className={`relative w-full border-2 ${step.color} rounded-2xl p-4 text-center space-y-1.5 shadow-xs`}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">STEP {step.step}</span>
                  </div>
                  <div className="font-black text-sm text-indigo-950">{step.label}</div>
                  <div className="text-xs font-semibold text-slate-600">{step.desc}</div>
                </div>
                {i < aiPipeline.length - 1 && (
                  <div className="flex justify-center py-0.5 text-indigo-500">
                    <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="animate-pulse">
                      <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Desktop Horizontal Flow (>= sm) */}
          <div className="hidden sm:flex items-start gap-0 overflow-x-auto">
            {aiPipeline.map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                  {/* Step card */}
                  <div className={`relative w-full border-2 ${step.color} rounded-2xl p-4 text-center space-y-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
                    <div className="text-2xl">{step.icon}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-60">STEP {step.step}</div>
                    <div className="font-black text-sm leading-tight">{step.label}</div>
                    <div className="text-[10px] font-semibold opacity-70 leading-snug">{step.desc}</div>
                    {/* Animated active dot */}
                    <div className="flex justify-center">
                      <span className="w-2 h-2 rounded-full bg-current animate-ping opacity-60" />
                    </div>
                  </div>
                </div>
                {/* Arrow connector */}
                {i < aiPipeline.length - 1 && (
                  <div className="flex items-center self-start mt-8 px-1 shrink-0">
                    <div className="flex items-center gap-0.5">
                      <div className="w-4 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400" />
                      <div className="w-4 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 animate-pulse" />
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-indigo-500 shrink-0">
                        <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Bottom rule */}
          <div className="mt-6 pt-4 border-t-2 border-indigo-100/90 flex flex-wrap gap-3 items-center">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Invariants:</span>
            {['AI never auto-mutates state', 'Human confirmation required', 'Database is single truth source', 'Advisory is non-authoritative'].map((rule, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {rule}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           PUBLIC vs PRIVATE ARCHITECTURE BOUNDARY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-cyan-50/90 border-2 border-indigo-200/90 rounded-3xl p-8 sm:p-14 shadow-2xl shadow-indigo-500/10 space-y-8 max-w-[1720px] mx-auto overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />

        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-indigo-900 bg-indigo-100/90 border border-indigo-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Architecture Boundary
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
            Public Website vs Private Operating Environment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative bg-white/95 p-8 rounded-2xl border-2 border-cyan-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-5 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">🌐</div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-cyan-700">Unauthenticated Layer</div>
                <h4 className="font-black text-xl text-indigo-950">Public Experience</h4>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed font-semibold text-sm">
              Communicates product methodology, system flow architecture, capabilities breakdown, and engineering philosophy without exposing private records or internal user state.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Homepage', 'How It Works', 'Capabilities', 'About'].map(p => (
                <span key={p} className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg">{p}</span>
              ))}
            </div>
          </div>

          <div className="relative bg-white/95 p-8 rounded-2xl border-2 border-emerald-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-5 overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">🔒</div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Authenticated Layer</div>
                <h4 className="font-black text-xl text-indigo-950">Private Operating System</h4>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed font-semibold text-sm">
              Secure environment containing user workstreams, strategic goals, active tasks, capacity schedules, skill logs, career opportunity pipelines, evidence items, and intelligence advisory.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Workstreams', 'Goals', 'Evidence Vault', 'AI Advisory', 'Career Pipeline'].map(p => (
                <span key={p} className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           FINAL CTA BANNER — Premium Glass
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 border-2 border-blue-200/90 p-12 sm:p-16 text-center space-y-8 shadow-2xl shadow-blue-500/10 max-w-[1720px] mx-auto overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-indigo-900 bg-indigo-100/90 border border-indigo-300 px-4 py-1.5 rounded-full tracking-widest">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Ready to Operate
          </div>
          <h3 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">
            Enter your personal operating environment.
          </h3>
          <p className="text-slate-600 font-semibold text-xl max-w-2xl mx-auto">
            Connect strategic direction, daily execution, verified proof, and long-term trajectory into a single disciplined system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 relative z-10">
          <Link
            to="/login"
            className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-lg sm:shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/60 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 overflow-hidden whitespace-nowrap">
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              <span>Get Started Free</span>
              <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-blue-600 group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                →
              </span>
            </span>
          </Link>

          <Link
            to="/login"
            className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-blue-300 via-indigo-400 to-sky-300 shadow-md sm:shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 group-hover/btn:text-blue-700 font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-colors overflow-hidden whitespace-nowrap">
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />
              <span>Sign In</span>
              <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                🔑
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};
