import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

export const HowItWorksPage: React.FC = () => {
  const methodologySteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'STRATEGIC TRAJECTORY',
      title: 'DEFINTION OF INTENTION & WORKSTREAMS',
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
      title: 'HIERARCHICAL TASK DECOMPOSITION',
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
      title: 'TIME-BLOCKED DAILY BUDGETING',
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
      title: 'NEXT BEST ACTION ALGORITHM',
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
      title: 'OBSERVABLE PROOF & CAREER GROWTH',
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
      <section className="w-full pt-4 pb-10 sm:pb-14 bg-white">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-4 sm:space-y-5 relative">
          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.02] max-w-5xl mx-auto">
            <span>From Intention to</span>
            <span className="block text-[#20B5D6]">
              Verifiable Engineering Proof.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            KENENISA OS transforms strategic ambition into structured execution, capacity-matched daily planning, observable evidence, and continuous career growth.
          </p>
        </div>
      </section>

      {/* ── THE SERPENTINE ENGINEERING ROADMAP (HIGH-IMPACT VISUAL) ──────────────── */}
      <section className="w-full">
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
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Built on 3 Engineering Principles
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-semibold">
              Eliminate wasted focus, manual tracking, and disjointed tool stacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pillar 1 */}
            <div className="relative bg-white/95 border-2 border-cyan-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3.5 sm:space-y-4 shadow-xl shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 group overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20B5D6] to-blue-600" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[1.75rem] bg-gradient-to-br from-[#20B5D6] to-blue-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest text-center">PILLAR 01</div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#20B5D6] transition-colors">Deterministic Execution</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  No guessing what to work on next. The Next Best Action engine evaluates open task dependencies, deadlines, and scheduled focus blocks.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="relative bg-white/95 border-2 border-orange-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3.5 sm:space-y-4 shadow-xl shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/20 group overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FE721D] to-orange-600" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[1.75rem] bg-gradient-to-br from-[#FE721D] to-orange-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-orange-500/20 group-hover:scale-110 transition-transform">
                🛡️
              </div>
              <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest text-center">PILLAR 02</div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#FE721D] transition-colors">Observable Proof Vault</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  Task completions generate verifiable evidence items (PRs, commits, test runs, architecture docs) stored directly in your Evidence Vault.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="relative bg-white/95 border-2 border-cyan-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-3.5 sm:space-y-4 shadow-xl shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 group overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20B5D6] to-sky-600" />
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl sm:rounded-[1.75rem] bg-gradient-to-br from-[#20B5D6] to-sky-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest text-center">PILLAR 03</div>
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-[#20B5D6] transition-colors">Multi-Outcome Sync</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  Completing one task simultaneously advances coursework, software projects, skill capabilities, and target career opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGINEERING R&D PHILOSOPHY ─────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/70 via-emerald-50/50 to-slate-50/70 py-16 sm:py-24 overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 text-center relative z-10">
          <div className="space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Think Like an Engineer
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              KENENISA OS applies scientific rigor and software engineering principles to personal skill building and career progression.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-center text-xs">
            {/* 1. Problem */}
            <div className="relative bg-white/95 border-2 border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5 sm:space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-slate-400 transition-all duration-300 group/step overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">1. Problem</span>
              <p className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-slate-700 transition-colors">Identify Gap</p>
            </div>

            {/* 2. Question */}
            <div className="relative bg-white/95 border-2 border-cyan-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5 sm:space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-cyan-400 transition-all duration-300 group/step overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#20B5D6]" />
              <span className="text-[10px] font-black text-[#20B5D6] uppercase tracking-widest block">2. Question</span>
              <p className="font-black text-sm sm:text-base text-cyan-950 group-hover/step:text-[#20B5D6] transition-colors">Hypothesize</p>
            </div>

            {/* 3. Design */}
            <div className="relative bg-white/95 border-2 border-teal-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5 sm:space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-teal-400 transition-all duration-300 group/step overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
              <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest block">3. Design</span>
              <p className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-teal-600 transition-colors">Architecture</p>
            </div>

            {/* 4. Build */}
            <div className="relative bg-white/95 border-2 border-orange-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5 sm:space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-orange-400 transition-all duration-300 group/step overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FE721D]" />
              <span className="text-[10px] font-black text-[#FE721D] uppercase tracking-widest block">4. Build</span>
              <p className="font-black text-sm sm:text-base text-orange-950 group-hover/step:text-[#FE721D] transition-colors">Implementation</p>
            </div>

            {/* 5. Verification */}
            <div className="relative bg-white/95 border-2 border-emerald-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5 sm:space-y-2 shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-400 transition-all duration-300 group/step overflow-hidden col-span-2 sm:col-span-1">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">5. Verification</span>
              <p className="font-black text-sm sm:text-base text-emerald-950 group-hover/step:text-emerald-600 transition-colors">Evidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/60 via-white to-orange-50/60 py-16 sm:py-24 text-center overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-6 relative z-10">
          <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to examine the full system capabilities?
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 pt-2">
            <Link
              to="/capabilities"
              className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] shadow-lg sm:shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] text-white font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 overflow-hidden whitespace-nowrap">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <span>Explore Capabilities</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-[#FE721D] group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                  →
                </span>
              </span>
            </Link>

            <Link
              to="/login"
              className="relative group/btn w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-[#20B5D6] to-[#FE721D] shadow-md sm:shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span className="relative w-full sm:w-auto px-5 py-2.5 sm:px-9 sm:py-4 rounded-full bg-white/95 backdrop-blur-xl text-slate-900 group-hover/btn:text-[#20B5D6] font-black text-xs sm:text-base tracking-wide flex items-center justify-center gap-2 sm:gap-3 transition-colors duration-200 overflow-hidden whitespace-nowrap border border-slate-200">
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#20B5D6]/20 to-transparent pointer-events-none" />
                <span>Sign In</span>
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-cyan-50 text-[#20B5D6] flex items-center justify-center group-hover/btn:bg-[#FE721D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
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


