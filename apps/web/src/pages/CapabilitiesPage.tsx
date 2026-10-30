import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

export const CapabilitiesPage: React.FC = () => {
  const capabilitySteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'EXECUTION ENGINE',
      title: 'HIERARCHICAL WORK DECOMPOSITION',
      subtitle: 'From High-Level Strategy to Executable Tasks.',
      description:
        'Organize strategic direction into Workstreams, Goals, Projects, Milestones, and Tasks with strict priority levels (P0 Critical, P1 High) and blocker dependencies.',
      focusAreas: [
        'Workstreams, Goals, Projects & Tasks',
        'Strict P0 / P1 / P2 Priority levels',
        'Task dependency graphs & blocker tracking',
        'Project milestone completion tracking',
      ],
      themeColor: '#2563EB',
      bgBadgeColor: 'bg-blue-100 border-blue-200 text-[#2563EB]',
      badgeTextColor: 'text-[#2563EB]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'CAPACITY PLANNING',
      title: 'CAPACITY & SCHEDULE MATCHING',
      subtitle: 'Match Effort with Real Available Time.',
      description:
        'Realistic daily capacity budgeting. Map available time blocks against estimated task effort to eliminate overload, identify scheduling conflicts, and maintain velocity.',
      focusAreas: [
        'Daily available hours budget vs task estimates',
        'Time-blocking schedule grid',
        'Conflict & overcommitment alerts',
        'Realistic effort estimation (Estimate ≠ Scheduled)',
      ],
      themeColor: '#0284C7',
      bgBadgeColor: 'bg-cyan-100 border-cyan-200 text-[#0284C7]',
      badgeTextColor: 'text-[#0284C7]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: '03',
      badgeTitle: 'SKILL DEVELOPMENT',
      title: 'LEARNING & SKILL PRACTICE',
      subtitle: 'Connect Theoretical Knowledge to Real Output.',
      description:
        'Track course progress, technical reading, certifications, and target skills. Link skill practice directly to active software projects for real-world application.',
      focusAreas: [
        'Skill verification levels (Beginner → Expert)',
        'Learning resource linking & progress logging',
        'Direct integration with project execution',
        'Certifications & course completion logs',
      ],
      themeColor: '#6366F1',
      bgBadgeColor: 'bg-indigo-100 border-indigo-200 text-[#6366F1]',
      badgeTextColor: 'text-[#6366F1]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      number: '04',
      badgeTitle: 'EVIDENCE VAULT',
      title: 'VERIFIABLE PROOF & ARTIFACTS',
      subtitle: 'Proof Before Assertions.',
      description:
        'Store concrete artifacts proving task and project completions. Keep pull request links, technical documentation, deployed sites, and test verification output in one verifiable vault.',
      focusAreas: [
        'Observable proof item repository',
        'Verification URL & artifact metadata tracking',
        'Weekly review reflection attachments',
        'Test pass rate & commit proof logs',
      ],
      themeColor: '#16A34A',
      bgBadgeColor: 'bg-emerald-100 border-emerald-200 text-[#16A34A]',
      badgeTextColor: 'text-[#16A34A]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: '05',
      badgeTitle: 'CAREER PIPELINE',
      title: 'CAREER OPPORTUNITY PIPELINE',
      subtitle: 'Translate Execution into Real Market Value.',
      description:
        'Manage target job roles, academic applications, and client proposals. Map required role skills against verified evidence items to identify gaps and target interview preparation.',
      focusAreas: [
        'Opportunity stage pipeline (Target → Applied → Offer)',
        'Skill gap analysis against job descriptions',
        'Evidence portfolio matching per application',
        'Interview preparation & proposal tracking',
      ],
      themeColor: '#D97706',
      bgBadgeColor: 'bg-amber-100 border-amber-200 text-amber-800',
      badgeTextColor: 'text-amber-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '06',
      badgeTitle: 'INTELLIGENCE CORE',
      title: 'CONTEXTUAL AI ADVISORY',
      subtitle: 'AI Advisory Without Replacing Human Agency.',
      description:
        'Advisory layer reasoning over system state. Analyzes task progress, capacity conflicts, and evidence gaps to recommend high-impact actions while keeping human agency authoritative.',
      focusAreas: [
        'Deterministic Next Best Action recommendation',
        'Contextual system state reasoning',
        'Human confirmation for all state mutations',
        'Dependency bottleneck & conflict detection',
      ],
      themeColor: '#9333EA',
      bgBadgeColor: 'bg-purple-100 border-purple-200 text-[#9333EA]',
      badgeTextColor: 'text-[#9333EA]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-24 py-6" id="capabilities-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 max-w-[1720px] mx-auto pt-4 relative">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-50/90 via-sky-50/90 to-cyan-50/90 border-2 border-blue-200/90 text-blue-900 text-xs font-black uppercase tracking-widest shadow-md shadow-blue-500/10 hover:scale-105 transition-all duration-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span>System Capabilities Architecture ⚡</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-indigo-950 tracking-tight leading-[1.12] max-w-5xl mx-auto">
          Built for <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">engineering precision</span> and real execution.
        </h1>

        {/* Supporting Copy */}
        <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-semibold">
          Explore the core modular components of KENENISA OS. Each capability works independently while sharing state across the entire operating system.
        </p>

        {/* ── INTERACTIVE SYSTEM ARCHITECTURE CAPABILITY MATRICES ── */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-5xl mx-auto text-center">
          {[
            { label: 'Execution Engine', code: 'MOD-01', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700', bg: 'bg-blue-50/90 border-blue-200/90', icon: '⚡' },
            { label: 'Capacity Planning', code: 'MOD-02', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-700', bg: 'bg-cyan-50/90 border-cyan-200/90', icon: '⏱️' },
            { label: 'Skill Development', code: 'MOD-03', color: 'from-indigo-500 to-purple-600', textColor: 'text-indigo-700', bg: 'bg-indigo-50/90 border-indigo-200/90', icon: '📘' },
            { label: 'Evidence Vault', code: 'MOD-04', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-700', bg: 'bg-emerald-50/90 border-emerald-200/90', icon: '🛡️' },
            { label: 'Career Pipeline', code: 'MOD-05', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-800', bg: 'bg-amber-50/90 border-amber-200/90', icon: '💼' },
            { label: 'AI Advisory', code: 'MOD-06', color: 'from-purple-500 to-pink-600', textColor: 'text-purple-700', bg: 'bg-purple-50/90 border-purple-200/90', icon: '🤖' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-4 border-2 ${item.bg} backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col items-center justify-center text-center`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-bold text-base shadow-md mb-2 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <div className="text-[10px] font-mono font-black tracking-wider text-slate-500 uppercase mb-0.5">{item.code}</div>
              <div className="text-xs sm:text-sm font-black text-indigo-950 group-hover:text-blue-700 transition-colors leading-snug">
                {item.label}
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                State Active
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONNECTED CAPABILITIES SERPENTINE ROADMAP ───────────────────────────── */}
      <section>
        <SerpentineRoadmap
          title="Connected System Capabilities Architecture"
          subtitle="No isolated silos. Information flows seamlessly between operational modules to turn goals into verifiable outcomes."
          badgeText="INTERCONNECTED SYSTEM CAPABILITIES"
          summaryBadgeText="SIX PILLARS"
          summaryTitle="CONNECTED OPERATING SYSTEM ENGINE"
          summaryDescription="Each capability module functions independently while sharing real-time system state across your personal operating environment."
          summaryMetaText="KENENISA OS • CAPABILITIES SPECIFICATION"
          steps={capabilitySteps}
        />
      </section>

      {/* ── SECURITY & CONTROL ARCHITECTURE ─────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-50/90 via-sky-50/70 to-purple-50/90 border-2 border-indigo-200/90 rounded-3xl p-8 sm:p-14 shadow-2xl shadow-indigo-500/10 space-y-10 max-w-[1720px] mx-auto overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-600" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-900 bg-blue-100/90 border border-blue-300 px-4 py-1.5 rounded-full tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Data Ownership &amp; Security
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
            Security &amp; Privacy Architecture
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-semibold">
            Enterprise-grade security standards with human-in-the-loop control.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs relative z-10">
          {/* Card 1 */}
          <div className="relative bg-white/95 border-2 border-blue-200/90 rounded-2xl p-6 space-y-3 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shadow-inner">
              🔒
            </div>
            <h4 className="font-black text-lg text-indigo-950 group-hover/card:text-blue-700 transition-colors">
              Isolated Private Operating Context
            </h4>
            <p className="text-slate-700 leading-relaxed font-semibold text-sm">
              All personal tasks, goals, project artifacts, and evidence reside behind strict authenticated sessions. Public pages never expose private user data.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative bg-white/95 border-2 border-purple-200/90 rounded-2xl p-6 space-y-3 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg shadow-inner">
              🤖
            </div>
            <h4 className="font-black text-lg text-indigo-950 group-hover/card:text-purple-700 transition-colors">
              Human-In-The-Loop AI
            </h4>
            <p className="text-slate-700 leading-relaxed font-semibold text-sm">
              Intelligence Core acts strictly as an advisory layer. The system will never mutate tasks, delete projects, or send external data without explicit human confirmation.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative bg-white/95 border-2 border-cyan-200/90 rounded-2xl p-6 space-y-3 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-lg shadow-inner">
              🗄️
            </div>
            <h4 className="font-black text-lg text-indigo-950 group-hover/card:text-cyan-700 transition-colors">
              Authoritative System State
            </h4>
            <p className="text-slate-700 leading-relaxed font-semibold text-sm">
              Your PostgreSQL database state is the single source of truth. AI reasoning is transient and downstream from verified database state.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl bg-gradient-to-br from-blue-50/90 via-sky-50/80 to-indigo-50/90 border-2 border-blue-200/90 p-10 sm:p-14 text-center space-y-6 shadow-2xl shadow-blue-500/10 max-w-[1720px] mx-auto overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-600" />
        
        <h3 className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight">
          Ready to start using these capabilities?
        </h3>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-2 relative z-10">
          <Link
            to="/login"
            className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-lg sm:shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
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
            to="/about"
            className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-blue-300 via-indigo-400 to-sky-300 shadow-md sm:shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 group-hover/btn:text-blue-700 font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-200 overflow-hidden whitespace-nowrap">
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none" />
              <span>About KENENISA OS</span>
              <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                ℹ️
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};

