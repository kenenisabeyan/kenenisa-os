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
      themeColor: '#20B5D6', bgBadgeColor: 'bg-cyan-50 border-cyan-200 text-[#20B5D6]', badgeTextColor: 'text-[#20B5D6]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      number: '02', badgeTitle: 'ARCHITECTURE', title: 'DESIGN & FORMULATE BLUEPRINTS',
      subtitle: 'Architect Clean Contracts & Data Schemas.',
      description: 'Construct clear information architecture, PostgreSQL schemas, domain service contracts, and UI design systems prior to writing production code.',
      focusAreas: ['Domain model & database schema design', 'REST API & controller specifications', 'Google Roboto design system & UI tokens', 'Deterministic state transition logic'],
      themeColor: '#FE721D', bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#FE721D]', badgeTextColor: 'text-[#FE721D]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
    {
      number: '03', badgeTitle: 'IMPLEMENTATION', title: 'BUILD MODULAR SOFTWARE',
      subtitle: 'Engineering Execution Without Superficial Decoration.',
      description: 'Develop resilient Express services, React SPA pages, state management hooks, and background execution algorithms focused on core system utility.',
      focusAreas: ['TypeScript API & Vite SPA implementation', 'Capacity & daily plan calculation engines', 'Evidence logging & artifact mapping', 'Argon2id auth & session management'],
      themeColor: '#20B5D6', bgBadgeColor: 'bg-cyan-50 border-cyan-200 text-[#20B5D6]', badgeTextColor: 'text-[#20B5D6]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    },
    {
      number: '04', badgeTitle: 'VERIFICATION', title: 'TEST & COLLECT PROOF',
      subtitle: 'Empirical Proof Before Declaring Success.',
      description: 'Validate every feature using strict Vitest test suites, full TypeScript compilation checks, Vite production builds, and observable runtime evidence.',
      focusAreas: ['Automated API & Web Vitest test coverage', 'Strict tsc type-checking & linting', 'Production bundle optimization & audits', 'Empirical log-based error diagnosis'],
      themeColor: '#FE721D', bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#FE721D]', badgeTextColor: 'text-[#FE721D]',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      number: '05', badgeTitle: 'EVOLUTION', title: 'EVALUATE & CONTINUOUSLY EVOLVE',
      subtitle: 'Refine Architecture Based on Real Execution Data.',
      description: 'Refine capacity assumptions, upgrade UI components, integrate AI advisory insights, and evolve product capabilities through continuous iterative feedback.',
      focusAreas: ['System state & capacity audit review', 'Intelligence Core AI advisory optimization', 'Component refactoring & design system polish', 'Long-term product roadmap evolution'],
      themeColor: '#20B5D6', bgBadgeColor: 'bg-cyan-50 border-cyan-200 text-[#20B5D6]', badgeTextColor: 'text-[#20B5D6]',
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
      color: 'from-[#20B5D6] via-blue-600 to-indigo-600', bg: 'bg-cyan-50/90 border-[#20B5D6]/30', hoverText: 'text-[#20B5D6]',
      detailBg: 'bg-cyan-50/95 border-[#20B5D6]/40',
    },
    {
      icon: '🛡️', title: 'Evidence Before Assumptions',
      tagline: 'Proof or it didn\'t happen.',
      body: 'Decisions and progress claims must be backed by observable proof (commits, test passes, documents, deliverables) rather than arbitrary assertions.',
      detail: 'Assertions without evidence are noise. Verifiable artifacts are the only valid currency of progress.',
      color: 'from-[#FE721D] via-orange-500 to-amber-600', bg: 'bg-orange-50/90 border-[#FE721D]/30', hoverText: 'text-[#FE721D]',
      detailBg: 'bg-orange-50/95 border-[#FE721D]/40',
    },
    {
      icon: '⚡', title: 'Simplicity Before Complexity',
      tagline: 'Elegant, not elaborate.',
      body: 'Never introduce complicated workflows or heavy dependencies merely because they are fashionable. Maintain clear, simple execution pathways.',
      detail: 'Complexity is debt. Every abstraction must reduce friction, not add layers of indirection without benefit.',
      color: 'from-[#20B5D6] via-sky-500 to-cyan-700', bg: 'bg-cyan-50/90 border-[#20B5D6]/30', hoverText: 'text-[#20B5D6]',
      detailBg: 'bg-cyan-50/95 border-[#20B5D6]/40',
    },
    {
      icon: '🤖', title: 'Human Agency Authoritative',
      tagline: 'AI advises. Humans decide.',
      body: 'AI serves strictly as an advisory intelligence layer. The user retains absolute authority over decisions, planning changes, and state mutations.',
      detail: 'The system never auto-mutates user state. Every AI recommendation requires explicit human confirmation before execution.',
      color: 'from-[#FE721D] via-rose-500 to-orange-700', bg: 'bg-orange-50/90 border-[#FE721D]/30', hoverText: 'text-[#FE721D]',
      detailBg: 'bg-orange-50/95 border-[#FE721D]/40',
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
    <div className="w-full flex flex-col space-y-0" id="about-page">

      {/* ══════════════════════════════════════════════════════════════════════
           HERO — High-Contrast Split Hero with Layered Portrait Card
           (Meticulously styled to match Alazar visual aesthetic)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full pt-4 pb-10 sm:pb-14 bg-white overflow-hidden" id="hero">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            
            {/* Left Column: Huge High-Impact Typography & Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[1.02] break-words">
                <span>Kenenisa Beyan.</span>
                <span className="block text-[#20B5D6]">
                  Director &amp; Visual Systems
                </span>
              </h1>

              <p className="text-sm xs:text-base sm:text-xl text-slate-600 max-w-2xl font-medium leading-relaxed">
                Engineering Architect &amp; Software Systems Lead designing deterministic operating platforms, evidence-backed proof vaults, and ground-truth AI reasoning architectures at Adama Science and Technology University (ASTU).
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                <a
                  href="#principles"
                  className="px-6 sm:px-7 py-3 sm:py-3.5 bg-[#FE721D] hover:bg-[#e56315] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-md shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>EXPLORE WORK</span>
                  <span>▾</span>
                </a>
                <a
                  href="#roadmap"
                  className="px-6 sm:px-7 py-3 sm:py-3.5 border-2 border-[#20B5D6] hover:bg-[#20B5D6] hover:text-white bg-white text-[#20B5D6] font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-md shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>SYSTEM ROADMAP</span>
                  <span>▸</span>
                </a>
              </div>

              {/* Stat Counters matching the reference portfolio metrics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-6 sm:pt-8 border-t border-slate-200/80 max-w-xl">
                <div>
                  <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">5+</div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Years Experience</div>
                </div>
                <div>
                  <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-[#FE721D] tracking-tight">140+</div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Projects &amp; Milestones</div>
                </div>
                <div>
                  <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">99%</div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Verified Evidence</div>
                </div>
              </div>
            </div>

            {/* Right Column: Layered Portrait Media Card with Offset Backing Plate */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5]">
                {/* Offset Backing Plate in Kenenisa OS Brand Gradient */}
                <div className="absolute -bottom-5 -right-5 sm:-bottom-7 sm:-right-7 inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#20B5D6]/20 to-[#FE721D]/20 border-2 border-[#20B5D6]/40 -z-10 shadow-lg" />
                
                {/* Main Rounded Portrait Card */}
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 relative group">
                  <img
                    src="/kenenisa-portrait.jpg"
                    alt="Kenenisa Beyan"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo-icon.jpg';
                    }}
                  />

                  {/* Viewfinder Circle Graphic Element (matching Reference Screenshot) */}
                  <div className="absolute top-1/2 right-8 -translate-y-1/2 w-8 h-8 rounded-full border border-white/80 bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-sm pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                  </div>

                  {/* Bottom Overlay Pill */}
                  <div className="absolute bottom-5 inset-x-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-slate-900">Kenenisa Beyan</div>
                      <div className="text-[10px] font-bold text-[#20B5D6] uppercase tracking-wider">ASTU &bull; Computer Science and Engineering Lead</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           ANIMATED SYSTEM STATISTICS
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="w-full py-12 sm:py-16 bg-white">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14">
          <div className="text-center mb-10 space-y-3">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           THE FRAGMENTATION PROBLEM — 3-column with visual dividers
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/50 via-sky-50/30 to-slate-50/60 py-16 sm:py-24 overflow-hidden">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 relative z-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">The Fragmentation Problem</h2>
            <p className="text-lg text-slate-600 font-semibold max-w-3xl mx-auto">
              Modern practitioners operate across too many disconnected tools. This creates three compounding failures:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                num: '01', icon: '🎯', title: 'High Operational Noise',
                body: 'Academic coursework sits in university portals; software engineering code lives in GitHub; task lists sit in personal todo apps; learning courses stay on tutorial sites; and career opportunities exist in scattered spreadsheets.',
                border: 'border-[#20B5D6]/30', badge: 'bg-cyan-100 text-cyan-900 border-[#20B5D6]/30',
                gradient: 'from-[#20B5D6] to-blue-600',
              },
              {
                num: '02', icon: '⚡', title: 'Artificial Separation',
                body: 'This fragmentation creates artificial separation between what you intend to do, what you actually work on, and the verifiable proof of what you accomplished.',
                border: 'border-[#FE721D]/30', badge: 'bg-orange-100 text-orange-900 border-[#FE721D]/30',
                gradient: 'from-[#FE721D] to-orange-600',
              },
              {
                num: '03', icon: '🛡️', title: 'Unified OS Is the Fix',
                body: 'KENENISA OS replaces fragmented tools with a single unified operating environment where every action contributes directly to strategic goals and verifiable evidence.',
                border: 'border-[#20B5D6]/30', badge: 'bg-cyan-100 text-cyan-900 border-[#20B5D6]/30',
                gradient: 'from-[#20B5D6] to-sky-600',
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative bg-white/95 border-2 ${card.border} p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-3.5 sm:space-y-4 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden flex flex-col items-center text-center`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient}`} />
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-2xl sm:text-3xl shadow-lg mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${card.badge} border uppercase tracking-widest`}>
                  PROBLEM {card.num}
                </span>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#20B5D6] transition-colors">{card.title}</h4>
                <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           INTERACTIVE CORE PRINCIPLES — Expand on click
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full py-16 sm:py-24 bg-white" id="principles">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Product Philosophy 💎</h2>
            <p className="text-slate-600 font-semibold text-base sm:text-lg">Click any principle to expand its engineering rationale.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {principles.map((p, i) => {
              const isActive = activePrinciple === i;
              return (
                <div
                  key={i}
                  onClick={() => setActivePrinciple(isActive ? null : i)}
                  className={`relative bg-white/95 border-2 rounded-2xl sm:rounded-3xl p-5 xs:p-6 sm:p-7 md:p-8 flex flex-col items-center text-center shadow-md cursor-pointer overflow-hidden transition-all duration-500 group
                    ${isActive ? 'border-[#20B5D6] shadow-2xl shadow-cyan-500/20 scale-[1.01] sm:scale-[1.02]' : 'border-slate-200/80 hover:shadow-xl hover:-translate-y-1.5 hover:border-[#20B5D6]/60'}`}
                >
                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${p.color} transition-all duration-300`} />

                  {/* Active ring glow */}
                  {isActive && <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-2 ring-[#20B5D6]/40 pointer-events-none" />}

                  {/* Centered Squircle Icon Box - Adaptive sizing */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.75rem] bg-gradient-to-br ${p.color} text-white flex items-center justify-center text-2xl sm:text-4xl shadow-xl shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 mx-auto mb-3`}>
                    {p.icon}
                  </div>

                  {/* Centered Eyebrow & Title */}
                  <div className="space-y-1.5 text-center mb-2.5 sm:mb-3">
                    <div className="text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest text-center">{p.tagline}</div>
                    <h3 className={`text-lg sm:text-xl lg:text-2xl font-black text-slate-900 transition-colors duration-300 text-center leading-snug ${isActive ? p.hoverText : `group-hover:${p.hoverText}`}`}>
                      {p.title}
                    </h3>
                  </div>

                  {/* Centered Body */}
                  <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm text-center max-w-sm mb-3 sm:mb-4">{p.body}</p>

                  {/* Expanded detail - Responsive max-height */}
                  <div className={`w-full overflow-hidden transition-all duration-500 ${isActive ? 'max-h-60 sm:max-h-48 opacity-100 mb-3 sm:mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 ${p.detailBg} space-y-1.5 text-center`}>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Engineering Rationale</div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed text-center">{p.detail}</p>
                    </div>
                  </div>

                  {/* Expand indicator */}
                  <div className={`mt-auto flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#20B5D6]' : 'text-slate-400 group-hover:text-[#20B5D6]'}`}>
                    <span className={`inline-block transition-transform duration-300 ${isActive ? 'rotate-90' : ''}`}>▶</span>
                    <span>{isActive ? 'Collapse' : 'Expand Rationale'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           ENGINEERING R&D ROADMAP
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full">
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
      <section className="w-full relative bg-gradient-to-br from-slate-50/80 via-cyan-50/30 to-slate-50/80 py-16 sm:py-24 overflow-hidden" id="stack">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 relative z-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Engineering Stack 🔧</h2>
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           AI ADVISORY PIPELINE — Advanced Visual Diagram
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full relative bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-blue-50/60 py-16 sm:py-24 overflow-hidden">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-indigo-950 tracking-tight">AI Intelligence Pipeline 🤖</h2>
            <p className="text-slate-700 font-semibold text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              AI should increase clarity, not remove human agency. Intelligence is strictly downstream of real system data in KENENISA OS.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-purple-100/90 border-2 border-purple-300 px-4 py-1.5 rounded-full text-xs font-black text-purple-900 uppercase tracking-wider shadow-xs mt-1">
              Clear Boundary ⚡ Enforced
            </div>
          </div>

          {/* Pipeline diagram */}
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-indigo-200/90 shadow-md p-4 sm:p-8">
            {/* Mobile & Tablet Vertical Flow (< lg) */}
            <div className="lg:hidden flex flex-col gap-2.5">
              {aiPipeline.map((step, i) => (
                <React.Fragment key={i}>
                  <div className={`relative w-full border-2 ${step.color} rounded-2xl p-4 text-center space-y-1.5 shadow-xs`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl">{step.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">STEP {step.step}</span>
                    </div>
                    <div className="font-black text-sm text-slate-900">{step.label}</div>
                    <div className="text-xs font-semibold text-slate-600">{step.desc}</div>
                  </div>
                  {i < aiPipeline.length - 1 && (
                    <div className="flex justify-center py-0.5 text-[#20B5D6]">
                      <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="animate-pulse">
                        <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Desktop Horizontal Flow (>= lg) */}
            <div className="hidden lg:flex items-start gap-0 overflow-x-auto">
              {aiPipeline.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                    {/* Step card */}
                    <div className={`relative w-full border-2 ${step.color} rounded-2xl p-4 text-center space-y-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default`}>
                      <div className="text-2xl">{step.icon}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest opacity-60">STEP {step.step}</div>
                      <div className="font-black text-sm leading-tight text-slate-900">{step.label}</div>
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
                        <div className="w-4 h-0.5 bg-gradient-to-r from-[#20B5D6] to-blue-500" />
                        <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-[#20B5D6] animate-pulse" />
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#20B5D6] shrink-0">
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           PUBLIC vs PRIVATE ARCHITECTURE BOUNDARY
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full relative bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-cyan-50/60 py-16 sm:py-24 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-8 relative z-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
              Public Website vs Private Operating Environment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="relative bg-white/95 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-cyan-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-4 overflow-hidden group flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20B5D6] to-blue-600" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#20B5D6] to-blue-600 text-white text-2xl sm:text-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">🌐</div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#20B5D6]">Unauthenticated Layer</div>
                <h4 className="font-black text-xl sm:text-2xl text-slate-900">Public Experience</h4>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm max-w-md">
                Communicates product methodology, system flow architecture, capabilities breakdown, and engineering philosophy without exposing private records or internal user state.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-2">
                {['Homepage', 'How It Works', 'Capabilities', 'About'].map(p => (
                  <span key={p} className="text-[11px] sm:text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 px-2.5 sm:px-3 py-1 rounded-lg">{p}</span>
                ))}
              </div>
            </div>

            <div className="relative bg-white/95 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-orange-200/90 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 space-y-4 overflow-hidden group flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FE721D] to-orange-600" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#FE721D] to-amber-600 text-white text-2xl sm:text-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">🔒</div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#FE721D]">Authenticated Layer</div>
                <h4 className="font-black text-xl sm:text-2xl text-slate-900">Private Operating System</h4>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm max-w-md">
                Secure environment containing user workstreams, strategic goals, active tasks, capacity schedules, skill logs, career opportunity pipelines, evidence items, and intelligence advisory.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-2">
                {['Workstreams', 'Goals', 'Evidence Vault', 'AI Advisory', 'Career Pipeline'].map(p => (
                  <span key={p} className="text-[11px] sm:text-xs font-bold text-orange-900 bg-orange-50 border border-orange-200 px-2.5 sm:px-3 py-1 rounded-lg">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
           FINAL CTA BANNER — Premium Glass
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/60 via-white to-orange-50/60 py-16 sm:py-24 text-center overflow-hidden group">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-8 relative z-10">
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Enter your personal operating environment.
            </h3>
            <p className="text-slate-600 font-semibold text-xl max-w-2xl mx-auto">
              Connect strategic direction, daily execution, verified proof, and long-term trajectory into a single disciplined system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <Link
              to="/login"
              className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] shadow-lg sm:shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] text-white font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 overflow-hidden whitespace-nowrap">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <span>Get Started Free</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-[#FE721D] group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                  →
                </span>
              </span>
            </Link>

            <Link
              to="/login"
              className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-[#20B5D6] to-[#FE721D] shadow-md sm:shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-white/95 backdrop-blur-xl text-slate-900 group-hover/btn:text-[#20B5D6] font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-colors overflow-hidden whitespace-nowrap border border-slate-200">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#20B5D6]/20 to-transparent pointer-events-none" />
                <span>Sign In</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-cyan-50 text-[#20B5D6] flex items-center justify-center group-hover/btn:bg-[#FE721D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                  🔑
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
