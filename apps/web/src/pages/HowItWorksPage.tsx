import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

export const HowItWorksPage: React.FC = () => {
  const methodologySteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'STRATEGIC TRAJECTORY',
      title: 'Definition of Intention & Workstreams',
      subtitle: 'From Abstract Career Ambition to Quantified Objectives.',
      description:
        'Map your long-term direction into structured Workstreams (Engineering OS, Academic Research, Career Acceleration). Define measurable Goals with firm target dates.',
      focusAreas: [
        'Strategic Workstream taxonomy',
        'Quantitative milestone targets',
        'Trajectory vector alignment',
        'Priority matrix initialization',
      ],
      themeColor: '#0D9488',
      bgBadgeColor: 'bg-teal-100 border-teal-200 text-[#0D9488]',
      badgeTextColor: 'text-[#0D9488]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'GRAPH DECOMPOSITION',
      title: 'Hierarchical Task Decomposition',
      subtitle: 'Transforming Objectives into Executable Graph Nodes.',
      description:
        'Deconstruct high-level goals into multi-phase Projects, Milestone gates, and individual Actionable Tasks linked by strict dependency graphs and priority tags (P0/P1).',
      focusAreas: [
        'Multi-tiered deliverable breakdown',
        'P0 Critical / P1 High priority tags',
        'Dependency graph & blocker linking',
        'Verifiable output definitions',
      ],
      themeColor: '#0284C7',
      bgBadgeColor: 'bg-cyan-100 border-cyan-200 text-[#0284C7]',
      badgeTextColor: 'text-[#0284C7]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      number: '03',
      badgeTitle: 'CAPACITY MATCHING',
      title: 'Time-Blocked Daily Budgeting',
      subtitle: 'Deterministic Effort Matching to Available Hours.',
      description:
        'Eliminate overcommitment by calculating real daily focus budgets. Tasks are dynamically scheduled into dedicated focus blocks matching your exact capacity.',
      focusAreas: [
        'Daily focus hour budgeting',
        'Time-blocked schedule allocation',
        'Collision & overload prevention',
        'Realistic effort estimation models',
      ],
      themeColor: '#2563EB',
      bgBadgeColor: 'bg-blue-100 border-blue-200 text-[#2563EB]',
      badgeTextColor: 'text-[#2563EB]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: '04',
      badgeTitle: 'DETERMINISTIC ENGINE',
      title: 'Next Best Action Algorithm',
      subtitle: 'Zero Cognitive Friction in Task Selection.',
      description:
        'Execute deep work with absolute focus. The Deterministic Engine evaluates task priorities, unblocked dependencies, and capacity to recommend your exact next action.',
      focusAreas: [
        'System-derived Next Best Action algorithm',
        'Focus-mode deep work execution',
        'Unblocked dependency resolution',
        'Real-time output tracking',
      ],
      themeColor: '#EA580C',
      bgBadgeColor: 'bg-orange-100 border-orange-200 text-[#EA580C]',
      badgeTextColor: 'text-[#EA580C]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      number: '05',
      badgeTitle: 'VERIFIED EVIDENCE VAULT',
      title: 'Observable Proof & Career Growth',
      subtitle: 'Converting Daily Output into Verifiable Portfolio Assets.',
      description:
        'Task completions automatically output verifiable proof items (Git commits, PRs, docs, test passes) into the Evidence Vault to match target career opportunities.',
      focusAreas: [
        'Observable proof artifact repository',
        'Repository commit & PR verification',
        'Skill-to-opportunity mapping pipeline',
        'Continuous career trajectory evolution',
      ],
      themeColor: '#16A34A',
      bgBadgeColor: 'bg-emerald-100 border-emerald-200 text-[#16A34A]',
      badgeTextColor: 'text-[#16A34A]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col space-y-0" id="how-it-works-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section id="hero" className="w-full pt-2 sm:pt-4 pb-10 sm:pb-14 bg-white relative overflow-hidden">
        {/* Ambient Lighting & Micro-texture */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#20B5D6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#FE721D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#20B5D612_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-3 sm:space-y-4 relative z-10 scroll-reveal">
          {/* Headline */}
          <h1 className="font-black tracking-tight flex flex-col items-center justify-center max-w-5xl mx-auto">
            <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.05]">
              From Intention to
            </span>
            <span className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] bg-clip-text text-transparent tracking-tight leading-[1.1] mt-1 sm:mt-1.5">
              Verifiable Engineering Proof.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium pt-1">
            KENENISA OS transforms strategic ambition into structured execution, capacity-matched daily planning, observable evidence, and continuous career growth.
          </p>
        </div>
      </section>

      {/* ── THE SERPENTINE ENGINEERING ROADMAP (HIGH-IMPACT VISUAL) ──────────────── */}
      <section className="w-full scroll-reveal">
        <SerpentineRoadmap
          title="Engineering R&D Pipeline Architecture"
          subtitle="From abstract career objectives to observable digital proof and verified career growth."
          badgeText="SYSTEM METHODOLOGY"
          summaryBadgeText="PIPELINE FLOW"
          summaryTitle="SCIENTIFIC RIGOR & SYSTEMATIC EXECUTION"
          summaryDescription="KENENISA OS replaces fragmented task lists with a continuous engineering loop connecting goals, daily focus capacity, deterministic action, and verifiable output artifacts."
          summaryMetaText="KENENISA OS • METHODOLOGY PIPELINE"
          steps={methodologySteps}
        />
      </section>

      {/* ── 3 CORE METHODOLOGICAL PILLARS ────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Built on 3 Engineering Principles
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-semibold">
              Eliminate wasted focus, manual tracking, and disjointed tool stacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#20B5D6] via-blue-400/50 to-slate-200/60 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal-left delay-100">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#20B5D6]/25 blur-xl pointer-events-none group-hover:bg-[#20B5D6]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#20B5D6] to-blue-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-cyan-800 uppercase tracking-widest text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6] animate-pulse" />
                  <span>PILLAR 01</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 w-full min-w-0">
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#20B5D6] transition-colors break-words">Deterministic Execution</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium break-words">
                    No guessing what to work on next. The Next Best Action engine evaluates open task dependencies, deadlines, and scheduled focus blocks.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FE721D] via-orange-400/50 to-slate-200/60 shadow-xl shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal delay-200">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#FE721D]/25 blur-xl pointer-events-none group-hover:bg-[#FE721D]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-orange-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#FE721D] to-orange-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  🛡️
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/70 border border-orange-200 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-orange-800 uppercase tracking-widest text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE721D] animate-pulse" />
                  <span>PILLAR 02</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 w-full min-w-0">
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#FE721D] transition-colors break-words">Observable Proof Vault</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium break-words">
                    Task completions generate verifiable evidence items (PRs, commits, test runs, architecture docs) stored directly in your Evidence Vault.
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#20B5D6] via-sky-400/50 to-slate-200/60 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal-right delay-300">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-16 bg-[#20B5D6]/25 blur-xl pointer-events-none group-hover:bg-[#20B5D6]/40 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-48 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-gradient-to-br from-[#20B5D6] to-sky-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-cyan-800 uppercase tracking-widest text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6] animate-pulse" />
                  <span>PILLAR 03</span>
                </div>
                <div className="space-y-1.5 sm:space-y-2 w-full min-w-0">
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#20B5D6] transition-colors break-words">Multi-Outcome Sync</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium break-words">
                    Completing one task simultaneously advances coursework, software projects, skill capabilities, and target career opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGINEERING R&D PHILOSOPHY ─────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/70 via-emerald-50/50 to-slate-50/70 py-16 sm:py-24 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 text-center relative z-10">
          <div className="space-y-3 max-w-3xl mx-auto scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Think Like an Engineer
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              KENENISA OS applies scientific rigor and software engineering principles to personal skill building and career progression.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4 text-center text-xs">
            {/* 1. Problem */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-slate-400 via-slate-300/50 to-slate-200/60 shadow-md hover:shadow-xl hover:shadow-slate-400/20 hover:-translate-y-1.5 transition-all duration-300 group/step scroll-reveal delay-75">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-slate-400/15 blur-lg pointer-events-none group-hover/step:bg-slate-400/25 transition-all duration-300" />
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-slate-500 to-transparent rounded-full shadow-[0_0_8px_rgba(100,116,139,0.6)] pointer-events-none group-hover/step:left-2 group-hover/step:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3 xs:p-4 sm:p-5 space-y-1.5 sm:space-y-2 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] min-w-0">
                <span className="text-[9px] xs:text-[10px] font-black text-slate-600 uppercase tracking-widest block truncate">// 01 · Problem</span>
                <p className="font-black text-xs xs:text-sm sm:text-base text-indigo-950 group-hover/step:text-slate-700 transition-colors tracking-tight break-words">Identify Gap</p>
              </div>
            </div>

            {/* 2. Question */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-300/50 to-slate-200/60 shadow-md hover:shadow-xl hover:shadow-cyan-400/20 hover:-translate-y-1.5 transition-all duration-300 group/step scroll-reveal delay-150">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/20 blur-lg pointer-events-none group-hover/step:bg-[#20B5D6]/35 transition-all duration-300" />
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full shadow-[0_0_8px_rgba(32,181,214,0.7)] pointer-events-none group-hover/step:left-2 group-hover/step:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3 xs:p-4 sm:p-5 space-y-1.5 sm:space-y-2 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] min-w-0">
                <span className="text-[9px] xs:text-[10px] font-black text-[#20B5D6] uppercase tracking-widest block truncate">// 02 · Question</span>
                <p className="font-black text-xs xs:text-sm sm:text-base text-cyan-950 group-hover/step:text-[#20B5D6] transition-colors tracking-tight break-words">Hypothesize</p>
              </div>
            </div>

            {/* 3. Design */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-teal-400 via-teal-300/50 to-slate-200/60 shadow-md hover:shadow-xl hover:shadow-teal-400/20 hover:-translate-y-1.5 transition-all duration-300 group/step scroll-reveal delay-225">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-teal-400/20 blur-lg pointer-events-none group-hover/step:bg-teal-400/35 transition-all duration-300" />
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full shadow-[0_0_8px_rgba(20,184,166,0.7)] pointer-events-none group-hover/step:left-2 group-hover/step:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3 xs:p-4 sm:p-5 space-y-1.5 sm:space-y-2 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] min-w-0">
                <span className="text-[9px] xs:text-[10px] font-black text-teal-600 uppercase tracking-widest block truncate">// 03 · Design</span>
                <p className="font-black text-xs xs:text-sm sm:text-base text-indigo-950 group-hover/step:text-teal-600 transition-colors tracking-tight break-words">Architecture</p>
              </div>
            </div>

            {/* 4. Build */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-[#FE721D] via-orange-300/50 to-slate-200/60 shadow-md hover:shadow-xl hover:shadow-orange-400/20 hover:-translate-y-1.5 transition-all duration-300 group/step scroll-reveal delay-300">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FE721D]/20 blur-lg pointer-events-none group-hover/step:bg-[#FE721D]/35 transition-all duration-300" />
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FE721D] to-transparent rounded-full shadow-[0_0_8px_rgba(254,114,29,0.7)] pointer-events-none group-hover/step:left-2 group-hover/step:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3 xs:p-4 sm:p-5 space-y-1.5 sm:space-y-2 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] min-w-0">
                <span className="text-[9px] xs:text-[10px] font-black text-[#FE721D] uppercase tracking-widest block truncate">// 04 · Build</span>
                <p className="font-black text-xs xs:text-sm sm:text-base text-orange-950 group-hover/step:text-[#FE721D] transition-colors tracking-tight break-words">Implementation</p>
              </div>
            </div>

            {/* 5. Verification */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-300/50 to-slate-200/60 shadow-md hover:shadow-xl hover:shadow-emerald-400/20 hover:-translate-y-1.5 transition-all duration-300 group/step col-span-2 sm:col-span-1 scroll-reveal delay-375">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-emerald-400/20 blur-lg pointer-events-none group-hover/step:bg-emerald-400/35 transition-all duration-300" />
              <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full shadow-[0_0_8px_rgba(16,185,129,0.7)] pointer-events-none group-hover/step:left-2 group-hover/step:right-2 transition-all duration-300" />
              <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3 xs:p-4 sm:p-5 space-y-1.5 sm:space-y-2 text-center overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] min-w-0">
                <span className="text-[9px] xs:text-[10px] font-black text-emerald-600 uppercase tracking-widest block truncate">// 05 · Verification</span>
                <p className="font-black text-xs xs:text-sm sm:text-base text-emerald-950 group-hover/step:text-emerald-600 transition-colors tracking-tight break-words">Evidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/60 via-white to-orange-50/60 py-16 sm:py-24 text-center overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-6 relative z-10 scroll-reveal-scale">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to examine the full system capabilities?
          </h3>

          <div className="flex flex-nowrap items-center justify-center gap-1 xs:gap-2 sm:gap-5 pt-2 max-w-[calc(100%-0.75rem)] sm:max-w-full w-fit mx-auto">
            <Link
              to="/capabilities"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] shadow-lg sm:shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-2 xs:px-3 sm:px-9 py-1.5 xs:py-2 sm:py-4 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] text-white font-black text-[8.5px] xs:text-[10px] sm:text-base tracking-wide flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-3 overflow-hidden whitespace-nowrap">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <span>Explore Capabilities</span>
                <span className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-7 sm:h-7 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-[#FE721D] group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-[9px] xs:text-xs sm:text-sm">
                  →
                </span>
              </span>
            </Link>

            <Link
              to="/login"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] to-[#FE721D] shadow-md sm:shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-2 xs:px-3 sm:px-9 py-1.5 xs:py-2 sm:py-4 rounded-sm bg-white/95 backdrop-blur-xl text-slate-900 group-hover/btn:text-[#20B5D6] font-black text-[8.5px] xs:text-[10px] sm:text-base tracking-wide flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-3 transition-colors duration-200 overflow-hidden whitespace-nowrap border border-slate-200">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#20B5D6]/20 to-transparent pointer-events-none" />
                <span>Sign In</span>
                <span className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-7 sm:h-7 rounded-sm bg-cyan-50 text-[#20B5D6] flex items-center justify-center group-hover/btn:bg-[#FE721D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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


