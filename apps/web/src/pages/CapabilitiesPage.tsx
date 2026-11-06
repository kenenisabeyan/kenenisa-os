import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';
import { ZapIcon } from '../components/common/ZapIcon.js';

export const CapabilitiesPage: React.FC = () => {
  const capabilitySteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'EXECUTION ENGINE',
      title: 'Hierarchical Work Decomposition',
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
      title: 'Capacity & Schedule Matching',
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
      title: 'Learning & Skill Practice',
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
      title: 'Verifiable Proof & Artifacts',
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
      title: 'Career Opportunity Pipeline',
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
      title: 'Contextual AI Advisory',
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
    <div className="w-full flex flex-col space-y-0" id="capabilities-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="w-full pt-2 sm:pt-4 pb-10 sm:pb-14 bg-white relative overflow-hidden">
        {/* Ambient Lighting & Micro-texture */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#20B5D6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#FE721D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#20B5D612_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-3 sm:space-y-4 relative z-10 scroll-reveal">
          {/* Headline */}
          <h1 className="font-black tracking-tight flex flex-col items-center justify-center max-w-5xl mx-auto">
            <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.05]">
              Built for Engineering Precision &amp;
            </span>
            <span className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] bg-clip-text text-transparent tracking-tight leading-[1.1] mt-1 sm:mt-1.5">
              Modular System Architecture.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium pt-1">
            Explore the core modular capabilities of KENENISA OS. Each service works independently while sharing live PostgreSQL state across the entire operating system.
          </p>

          {/* ── INTERACTIVE SYSTEM ARCHITECTURE CAPABILITY MATRICES ── */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 max-w-5xl mx-auto text-center">
            {[
              { label: 'Execution Engine', code: 'MOD-01', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-700', bg: 'bg-blue-50/90 border-blue-200/90', icon: <ZapIcon className="w-5 h-5 text-white" /> },
              { label: 'Capacity Planning', code: 'MOD-02', color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-700', bg: 'bg-cyan-50/90 border-cyan-200/90', icon: '⏱️' },
              { label: 'Skill Development', code: 'MOD-03', color: 'from-indigo-500 to-purple-600', textColor: 'text-indigo-700', bg: 'bg-indigo-50/90 border-indigo-200/90', icon: '📘' },
              { label: 'Evidence Vault', code: 'MOD-04', color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-700', bg: 'bg-emerald-50/90 border-emerald-200/90', icon: '🛡️' },
              { label: 'Career Pipeline', code: 'MOD-05', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-800', bg: 'bg-amber-50/90 border-amber-200/90', icon: '💼' },
              { label: 'AI Advisory', code: 'MOD-06', color: 'from-purple-500 to-pink-600', textColor: 'text-purple-700', bg: 'bg-purple-50/90 border-purple-200/90', icon: '🤖' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-2.5 xs:p-3 sm:p-4 border-2 ${item.bg} backdrop-blur-md shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col items-center justify-between text-center min-h-[140px] xs:min-h-[155px] sm:min-h-[165px] scroll-reveal delay-${(idx + 1) * 75}`}
              >
                <div className="w-full min-w-0 flex flex-col items-center">
                  <div className={`w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center font-bold text-sm xs:text-base shadow-md mb-1.5 group-hover:scale-110 transition-transform shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="text-[9px] xs:text-[10px] font-mono font-black tracking-wider text-slate-500 uppercase mb-0.5">{item.code}</div>
                  <div className="text-[11px] xs:text-xs sm:text-sm font-black text-indigo-950 group-hover:text-blue-700 transition-colors leading-snug break-words max-w-full">
                    {item.label}
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[8px] xs:text-[9px] font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  State Active
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONNECTED CAPABILITIES SERPENTINE ROADMAP ───────────────────────────── */}
      <section className="w-full">
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
      <section className="w-full relative bg-gradient-to-br from-indigo-50/70 via-sky-50/50 to-purple-50/70 py-16 sm:py-24 overflow-hidden group">
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 text-center relative z-10">
          <div className="space-y-3 max-w-3xl mx-auto scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Security &amp; Privacy Architecture
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-semibold">
              Enterprise-grade security standards with human-in-the-loop control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs text-center">
            {/* Card 1: Secure Enclave */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#20B5D6] via-blue-400/50 to-slate-200/60 shadow-lg shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal-left delay-100">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#20B5D6]/25 blur-xl pointer-events-none group-hover:bg-[#20B5D6]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#20B5D6] to-blue-600 text-white flex items-center justify-center font-black text-xl sm:text-3xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  🔒
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-[9px] xs:text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6] animate-pulse" />
                  <span>SECURE ENCLAVE</span>
                </div>
                <h4 className="font-black text-sm xs:text-base sm:text-lg text-slate-900 group-hover:text-[#20B5D6] transition-colors break-words">
                  Isolated Private Operating Context
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm break-words">
                  All personal tasks, goals, project artifacts, and evidence reside behind strict authenticated sessions. Public pages never expose private user data.
                </p>
              </div>
            </div>

            {/* Card 2: Human Control */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FE721D] via-orange-400/50 to-slate-200/60 shadow-lg shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/25 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-200">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#FE721D]/25 blur-xl pointer-events-none group-hover:bg-[#FE721D]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-orange-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#FE721D] to-orange-600 text-white flex items-center justify-center font-black text-xl sm:text-3xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/70 border border-orange-200 text-[9px] xs:text-[10px] font-mono font-bold text-orange-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE721D] animate-pulse" />
                  <span>HUMAN CONTROL</span>
                </div>
                <h4 className="font-black text-sm xs:text-base sm:text-lg text-slate-900 group-hover:text-[#FE721D] transition-colors break-words">
                  Human-In-The-Loop AI
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm break-words">
                  Intelligence Core acts strictly as an advisory layer. The system will never mutate tasks, delete projects, or send external data without explicit human confirmation.
                </p>
              </div>
            </div>

            {/* Card 3: Database Truth */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#20B5D6] via-sky-400/50 to-slate-200/60 shadow-lg shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden sm:col-span-2 lg:col-span-1 scroll-reveal-right delay-300">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#20B5D6]/25 blur-xl pointer-events-none group-hover:bg-[#20B5D6]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#20B5D6] to-sky-600 text-white flex items-center justify-center font-black text-xl sm:text-3xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  🗄️
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-[9px] xs:text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6] animate-pulse" />
                  <span>DATABASE TRUTH</span>
                </div>
                <h4 className="font-black text-sm xs:text-base sm:text-lg text-slate-900 group-hover:text-[#20B5D6] transition-colors break-words">
                  Authoritative System State
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium text-xs sm:text-sm break-words">
                  Your PostgreSQL database state is the single source of truth. AI reasoning is transient and downstream from verified database state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/60 via-white to-orange-50/60 py-16 sm:py-24 text-center overflow-hidden group scroll-reveal-scale">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to start using these capabilities?
          </h3>

          <div className="flex flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-5 pt-2">
            <Link
              to="/login"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] shadow-lg sm:shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-3.5 xs:px-5 sm:px-9 py-2 xs:py-2.5 sm:py-4 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] text-white font-black text-[11px] xs:text-xs sm:text-base tracking-wide flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 overflow-hidden whitespace-nowrap">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <span>Get Started Free</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-[#FE721D] group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                  →
                </span>
              </span>
            </Link>

            <Link
              to="/about"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] to-[#FE721D] shadow-md sm:shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-3.5 xs:px-5 sm:px-9 py-2 xs:py-2.5 sm:py-4 rounded-sm bg-white/95 backdrop-blur-xl text-slate-900 group-hover/btn:text-[#20B5D6] font-black text-[11px] xs:text-xs sm:text-base tracking-wide flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 transition-colors duration-200 overflow-hidden whitespace-nowrap border border-slate-200">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#20B5D6]/20 to-transparent pointer-events-none" />
                <span>About KENENISA OS</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-sm bg-cyan-50 text-[#20B5D6] flex items-center justify-center group-hover/btn:bg-[#FE721D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

