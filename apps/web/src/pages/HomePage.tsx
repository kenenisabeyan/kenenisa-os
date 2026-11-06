import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';
import { ZapIcon } from '../components/common/ZapIcon.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const homeLoopSteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'DIRECTION & TARGETS',
      title: 'Define Strategic Direction',
      subtitle: 'Set Clear Objectives Before Execution.',
      description:
        'Establish high-level Workstreams (Engineering OS, University Coursework, Career Advancement) and quantitative Goals with target completion dates.',
      focusAreas: [
        'Workstream & trajectory definition',
        'Strategic goal & milestone target setting',
        'Academic & technical focus alignment',
        'Core priority matrix setup',
      ],
      themeColor: '#7C3AED',
      bgBadgeColor: 'bg-purple-100 border-purple-200 text-[#7C3AED]',
      badgeTextColor: 'text-[#7C3AED]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'WORK DECOMPOSITION',
      title: 'Structure Projects & Tasks',
      subtitle: 'Break Ambition into Executable Units.',
      description:
        'Deconstruct goals into executable multi-stage Projects, sequential Milestones, and actionable Tasks with strict P0/P1/P2 priority tags and dependency graphs.',
      focusAreas: [
        'Project & milestone hierarchy breakdown',
        'P0 Critical / P1 High priority tags',
        'Dependency graph & blocker tracking',
        'Deliverable & artifact definitions',
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
      title: 'Plan Capacity & Time Blocks',
      subtitle: 'Match Effort Against Available Focus Hours.',
      description:
        'Calculate real daily hours budget and allocate task effort into dedicated time blocks to eliminate overcommitment and scheduling collisions.',
      focusAreas: [
        'Daily & weekly capacity budgeting',
        'Focus time-blocking schedule grid',
        'Conflict & overload detection',
        'Realistic task effort estimation',
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
      badgeTitle: 'DETERMINISTIC EXECUTION',
      title: 'Execute via Next Best Action',
      subtitle: 'Focus Deep Work on High-Impact Tasks.',
      description:
        'Work through unblocked tasks using system-derived Next Best Action selection based on strategic priority, target deadlines, and available capacity.',
      focusAreas: [
        'System-derived Next Best Action algorithm',
        'Deep work focus session execution',
        'Dependency resolution & unblocking',
        'Real-time task completion tracking',
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
      badgeTitle: 'VERIFIED PROOF & CAREER',
      title: 'Produce Evidence & Advance Career',
      subtitle: 'Turn Completed Work into Real Career Assets.',
      description:
        'Task completions generate observable proof items (PRs, commits, test passes, docs) stored in the Evidence Vault to power job applications and career advancement.',
      focusAreas: [
        'Observable proof artifact repository',
        'Pull request & repository commit proof',
        'Skill-to-opportunity pipeline matching',
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
    <div className="w-full flex flex-col space-y-0" id="public-home-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section id="hero" className="w-full pt-2 sm:pt-4 pb-10 sm:pb-14 bg-white relative overflow-hidden">
        {/* Ambient Lighting & Micro-texture */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#20B5D6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#FE721D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#20B5D612_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 text-center space-y-4 sm:space-y-6 relative z-10">
          {/* Headline with balanced typographic hierarchy & brand gradient shimmer */}
          <div className="space-y-2 sm:space-y-3 max-w-5xl mx-auto scroll-reveal">
            <h1 className="font-black tracking-tight flex flex-col items-center justify-center">
              <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.05] whitespace-nowrap">
                Kenenisa Beyan.
              </span>
              <span className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] bg-clip-text text-transparent tracking-tight leading-[1.1] mt-1 sm:mt-1.5">
                Engineering OS &amp; Visual Architecture
              </span>
            </h1>

            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed pt-1">
              A unified operating platform connecting strategic direction, daily capacity budgeting, verified evidence, and ground-truth AI reasoning into one cohesive discipline.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 xs:gap-2.5 sm:gap-4 pt-1 scroll-reveal delay-100">
            <a
              href="#workstreams"
              className="px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 bg-[#FE721D] hover:bg-[#e56315] text-white font-extrabold text-[10px] xs:text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1.5 xs:gap-2 whitespace-nowrap"
            >
              <span>EXPLORE WORK</span>
              <span>▾</span>
            </a>

            <Link
              to="/how-it-works"
              className="px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 border-2 border-[#20B5D6] hover:bg-[#20B5D6]/10 text-[#20B5D6] bg-white/90 font-extrabold text-[10px] xs:text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1.5 xs:gap-2 whitespace-nowrap"
            >
              <span>SYSTEM TOUR</span>
              <span>▸</span>
            </Link>

            <Link
              to="/login"
              className="px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-3.5 bg-gradient-to-r from-[#20B5D6] to-[#FE721D] hover:from-[#1aa3c2] hover:to-[#e56315] text-white font-extrabold text-[10px] xs:text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1.5 xs:gap-2 whitespace-nowrap"
            >
              <span>LAUNCH OS</span>
              <span>→</span>
            </Link>
          </div>

          {/* 3 Metric Cards with Cybernetic Gradient Perimeter: always in one row */}
          <div className="grid grid-cols-3 gap-2 xs:gap-3.5 sm:gap-6 max-w-4xl mx-auto pt-4">
            {/* Metric 1 */}
            <div className="relative group p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-400/40 to-slate-200/60 shadow-md shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 transition-all duration-300 overflow-hidden scroll-reveal-left delay-150">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-10 bg-[#20B5D6]/20 blur-lg pointer-events-none group-hover:bg-[#20B5D6]/35 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-[2.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-32 group-hover:opacity-100 transition-all duration-500 z-10 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/30 via-white to-white rounded-[10px] sm:rounded-[14px] p-2.5 xs:p-4 sm:p-7 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">5+</div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight xs:tracking-wider sm:tracking-widest mt-1 sm:mt-2 leading-tight">Years Building Systems</div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium leading-tight">Architecture &amp; Full-Stack</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="relative group p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#FE721D] via-orange-400/40 to-slate-200/60 shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/25 hover:-translate-y-1 transition-all duration-300 overflow-hidden scroll-reveal delay-225">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-10 bg-[#FE721D]/20 blur-lg pointer-events-none group-hover:bg-[#FE721D]/35 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-[2.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-32 group-hover:opacity-100 transition-all duration-500 z-10 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-orange-50/30 via-white to-white rounded-[10px] sm:rounded-[14px] p-2.5 xs:p-4 sm:p-7 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-[#FE721D] tracking-tight">140+</div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight xs:tracking-wider sm:tracking-widest mt-1 sm:mt-2 leading-tight">Projects &amp; Milestones</div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium leading-tight">Academic &amp; Commercial</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="relative group p-[2px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#20B5D6] via-teal-400/40 to-slate-200/60 shadow-md shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:-translate-y-1 transition-all duration-300 overflow-hidden scroll-reveal-right delay-300">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-10 bg-[#20B5D6]/20 blur-lg pointer-events-none group-hover:bg-[#20B5D6]/35 transition-all duration-500" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-[2.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-32 group-hover:opacity-100 transition-all duration-500 z-10 pointer-events-none" />

              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/30 via-white to-white rounded-[10px] sm:rounded-[14px] p-2.5 xs:p-4 sm:p-7 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">

                <div className="text-2xl xs:text-3xl sm:text-5xl font-black text-[#20B5D6] tracking-tight">99%</div>
                <div className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight xs:tracking-wider sm:tracking-widest mt-1 sm:mt-2 leading-tight">Verified Proof &amp; Reliability</div>
                <p className="text-[8px] xs:text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium leading-tight">Deterministic Contracts</p>
              </div>
            </div>
          </div>

          {/* System Architecture Bar */}
          <div className="pt-8 sm:pt-10 max-w-[1720px] mx-auto scroll-reveal" id="workstreams">
            {/* 7-Step Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 relative z-10">
              {/* Step 1 */}
              <Link
                to="/workstreams"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-75"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/15 blur-lg pointer-events-none group-hover/step:bg-[#20B5D6]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 border border-cyan-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#20B5D6] group-hover/step:shadow-cyan-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#20B5D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#20B5D6] transition-colors">
                      Workstreams
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Strategic Direction
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 2 */}
              <Link
                to="/goals"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#FE721D] via-orange-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-150"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FE721D]/15 blur-lg pointer-events-none group-hover/step:bg-[#FE721D]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FE721D] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#FE721D] group-hover/step:shadow-orange-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#FE721D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      <circle cx="12" cy="12" r="4" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#FE721D] transition-colors">
                      Goals
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Target Objectives
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 3 */}
              <Link
                to="/projects"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-225"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/15 blur-lg pointer-events-none group-hover/step:bg-[#20B5D6]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 border border-cyan-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#20B5D6] group-hover/step:shadow-cyan-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#20B5D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#20B5D6] transition-colors">
                      Projects
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Project Modules
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 4 */}
              <Link
                to="/tasks"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#FE721D] via-orange-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-300"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FE721D]/15 blur-lg pointer-events-none group-hover/step:bg-[#FE721D]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FE721D] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#FE721D] group-hover/step:shadow-orange-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#FE721D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#FE721D] transition-colors">
                      Tasks
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Capacity Tasks
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 5 */}
              <Link
                to="/evidence"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-375"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/15 blur-lg pointer-events-none group-hover/step:bg-[#20B5D6]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 border border-cyan-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#20B5D6] group-hover/step:shadow-cyan-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#20B5D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#20B5D6] transition-colors">
                      Evidence
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Proof Vault
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 6 */}
              <Link
                to="/reflection"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#FE721D] via-orange-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden scroll-reveal delay-450"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#FE721D]/15 blur-lg pointer-events-none group-hover/step:bg-[#FE721D]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#FE721D] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-50 border border-orange-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#FE721D] group-hover/step:shadow-orange-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#FE721D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#FE721D] transition-colors">
                      Reflect
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      System Reflection
                    </p>
                  </div>
                </div>
              </Link>

              {/* Step 7 */}
              <Link
                to="/career"
                className="relative group/step p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-400/40 to-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden col-span-2 sm:col-span-1 lg:col-span-1 scroll-reveal delay-500"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/15 blur-lg pointer-events-none group-hover/step:bg-[#20B5D6]/30 transition-all duration-300" />
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full pointer-events-none group-hover/step:left-1 group-hover/step:right-1 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-3.5 xs:p-4 sm:p-5 text-center flex flex-col items-center justify-between min-h-[148px] sm:min-h-[160px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-50 border border-cyan-200 shadow-md flex items-center justify-center mx-auto mb-2 p-2.5 sm:p-3 group-hover/step:scale-110 group-hover/step:border-[#20B5D6] group-hover/step:shadow-cyan-500/20 transition-all duration-300">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#20B5D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 text-center w-full">
                    <h3 className="font-black text-xs sm:text-sm md:text-base text-slate-900 group-hover/step:text-[#20B5D6] transition-colors">
                      Career
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 leading-tight">
                      Verified Trajectory
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGH-IMPACT SERPENTINE ROADMAP JOURNEY ──────────────────────────────── */}
      <section className="w-full scroll-reveal">
        <SerpentineRoadmap
          title="Personal Engineering & Operating Loop"
          subtitle="From strategic direction to observable evidence and career progression."
          badgeText="SYSTEM OPERATING LOOP"
          summaryBadgeText="FIVE PHASES"
          summaryTitle="FROM DIRECTION TO DIGITAL PROOF"
          summaryDescription="KENENISA OS replaces fragmented tools with one continuous operating system loop connecting goals, daily capacity, execution, and verifiable output."
          summaryMetaText="KENENISA OS • OPERATING SYSTEM LOOP"
          steps={homeLoopSteps}
        />
      </section>

      {/* ── PROBLEM VS SOLUTION SECTION ─────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              The Problem: Fragmented Execution
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              Academic courses, software projects, skill learning, job applications, and personal goals often exist as disconnected silos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Traditional Disconnected Workflow */}
            <div className="relative rounded-3xl bg-gradient-to-br from-rose-50/80 via-rose-100/40 to-orange-50/60 p-4 xs:p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6 overflow-hidden scroll-reveal-left delay-100">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rose-200/80">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/40 shrink-0">
                    ✕
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-rose-950 tracking-tight break-words">
                    Traditional Disconnected Workflow
                  </h3>
                </div>
                <span className="text-[10px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                  Fragmented
                </span>
              </div>

              <ul className="space-y-3 sm:space-y-4 text-sm xs:text-base sm:text-lg text-rose-950 font-semibold">
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                  <span className="break-words">Tasks sit in one app while code pull requests sit in GitHub.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                  <span className="break-words">Courses and certifications are logged separately from active engineering projects.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                  <span className="break-words">Career opportunities lack observable evidence connecting them to completed work.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                  <span className="break-words">Daily planning is disconnected from long-term strategic direction.</span>
                </li>
              </ul>
            </div>

            {/* The KENENISA OS Operating System */}
            <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-100/40 to-cyan-50/60 p-4 xs:p-6 sm:p-8 md:p-10 space-y-4 sm:space-y-6 overflow-hidden scroll-reveal-right delay-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-200/80">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/40 shrink-0">
                    ✓
                  </div>
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-black text-emerald-950 tracking-tight break-words">
                    The KENENISA OS Operating System
                  </h3>
                </div>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                  Unified Loop
                </span>
              </div>

              <ul className="space-y-3 sm:space-y-4 text-sm xs:text-base sm:text-lg text-emerald-950 font-semibold">
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                  <span className="break-words">Goals directly break down into projects, milestones, and executable tasks.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                  <span className="break-words">Task completions automatically produce observable evidence items.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                  <span className="break-words">Verified skills link directly to completed project artifacts and target opportunities.</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3.5 bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                  <span className="break-words">Deterministic Next Best Action guides daily capacity execution.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE ENGINEERING CONCEPT SECTION ───────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-white text-center">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10">
          <div className="max-w-3xl mx-auto space-y-3 relative z-10 scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              One Activity. Multiple Outcomes.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              When you complete an engineering task in KENENISA OS, it simultaneously advances multiple strategic areas without redundant manual logging.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 xs:gap-3.5 sm:gap-5 relative z-10">
            {/* Academic */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-75">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Academic
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-blue-100 font-medium leading-snug break-words max-w-full">
                  Coursework &amp; Research
                </p>
              </div>
            </div>

            {/* Engineering */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-purple-600 to-indigo-800 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-150">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Engineering
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-purple-100 font-medium leading-snug break-words max-w-full">
                  Software &amp; Architecture
                </p>
              </div>
            </div>

            {/* Skill Gain */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-violet-600 to-fuchsia-700 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-violet-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-225">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Skill Gain
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-violet-100 font-medium leading-snug break-words max-w-full">
                  Verified Capabilities
                </p>
              </div>
            </div>

            {/* Evidence */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-300">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Evidence
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-emerald-100 font-medium leading-snug break-words max-w-full">
                  Proof of Output
                </p>
              </div>
            </div>

            {/* Portfolio */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-cyan-600 to-sky-700 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-375">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Portfolio
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-cyan-100 font-medium leading-snug break-words max-w-full">
                  Tangible Artifacts
                </p>
              </div>
            </div>

            {/* Career Value */}
            <div className="relative p-3.5 xs:p-4 sm:p-5 md:p-6 bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl space-y-2 sm:space-y-3 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 group/item overflow-hidden flex flex-col items-center justify-between min-h-[145px] xs:min-h-[160px] sm:min-h-[180px] text-center scroll-reveal delay-450">
              <div className="absolute top-0 left-3 right-3 sm:left-4 sm:right-4 h-[1.5px] sm:h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full pointer-events-none group-hover/item:left-1 group-hover/item:right-1 transition-all duration-300" />
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-xl xs:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner group-hover/item:scale-110 transition-transform duration-300 shrink-0">
                <svg className="w-5 h-5 xs:w-5.5 xs:h-5.5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="space-y-0.5 sm:space-y-1 w-full min-w-0">
                <span className="text-xs xs:text-sm sm:text-base md:text-lg font-black block tracking-tight break-words max-w-full">
                  Career Value
                </span>
                <p className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-amber-100 font-medium leading-snug break-words max-w-full">
                  Opportunity Pipeline
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMAND CENTER PREVIEW ───────────────────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-slate-50/80 via-cyan-50/20 to-purple-50/30 overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 scroll-reveal">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                Command Center &amp; Intelligence Core
              </h2>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full max-w-[270px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3.5 rounded-full bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] hover:from-[#1aa3c2] hover:to-[#e56315] text-white font-black text-xs sm:text-sm shadow-lg sm:shadow-xl shadow-orange-500/25 hover:scale-105 hover:shadow-orange-500/40 transition-all duration-300 shrink-0 group whitespace-nowrap"
            >
              <span>Launch Command Center</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Deterministic Next Best Action Card */}
            <div className="relative bg-gradient-to-br from-cyan-50/70 via-sky-50/50 to-blue-50/60 rounded-3xl p-4 xs:p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden group scroll-reveal-left delay-100">
              {/* Ambient Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/25 transition-all duration-500" />

              <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-cyan-200/80">
                <h3 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-indigo-950 flex items-center gap-2.5 break-words">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse shrink-0" />
                  <span>Deterministic Next Best Action</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-cyan-300 shadow-sm uppercase tracking-wider shrink-0">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  System Derived
                </span>
              </div>

              <p className="text-sm xs:text-base sm:text-lg text-slate-700 leading-relaxed font-semibold break-words">
                Instead of guessing what to work on next, the system analyzes open priorities (P0/P1), unblocked task dependencies, and scheduled capacity to recommend your exact next engineering task.
              </p>

              {/* Inner Recommendation Box */}
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-[#20B5D6] via-cyan-300/50 to-slate-200/60 shadow-xl shadow-cyan-500/15 hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 group/box">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#20B5D6]/20 blur-lg pointer-events-none group-hover/box:bg-[#20B5D6]/35 transition-all duration-300" />
                <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-[#20B5D6] to-transparent rounded-full shadow-[0_0_10px_rgba(32,181,214,0.7)] pointer-events-none group-hover/box:left-2 group-hover/box:right-2 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 xs:p-5 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest px-3 py-1 rounded-full shadow-md shadow-cyan-500/20">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>EXAMPLE RECOMMENDATION</span>
                    </div>
                    <span className="bg-rose-100 text-rose-800 border border-rose-300/80 px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider">
                      P0 Critical
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="font-black text-base xs:text-lg sm:text-xl text-indigo-950 group-hover/box:text-cyan-700 transition-colors break-words">
                      KENENISA OS Planning Engine Pull Request
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-cyan-900 bg-cyan-50 border border-cyan-200/90 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                        Engineering OS
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-900 bg-rose-50 border border-rose-200/90 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                        P0 Critical
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Advisory Layer Card */}
            <div className="relative bg-gradient-to-br from-purple-50/70 via-fuchsia-50/50 to-indigo-50/60 rounded-3xl p-4 xs:p-6 sm:p-8 space-y-4 sm:space-y-6 overflow-hidden group scroll-reveal-right delay-200">
              {/* Ambient Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-400/25 transition-all duration-500" />

              <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-purple-200/80">
                <h3 className="text-lg xs:text-xl sm:text-2xl font-black tracking-tight text-indigo-950 flex items-center gap-2.5 break-words">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 animate-pulse shrink-0" />
                  <span>AI Advisory Layer</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-purple-300 shadow-sm uppercase tracking-wider shrink-0">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  AI Advisory
                </span>
              </div>

              <p className="text-sm xs:text-base sm:text-lg text-slate-700 leading-relaxed font-semibold break-words">
                Intelligence Core acts as an advisory mentor over your system state. It analyzes work structure, identifies blockers, and provides actionable recommendations while keeping human decision-making authoritative.
              </p>

              {/* Inner Advisory Context Box */}
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-b from-purple-500 via-fuchsia-300/50 to-slate-200/60 shadow-xl shadow-purple-500/15 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group/box">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-purple-500/20 blur-lg pointer-events-none group-hover/box:bg-purple-500/35 transition-all duration-300" />
                <div className="absolute top-0 left-6 right-6 h-[2.5px] bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.7)] pointer-events-none group-hover/box:left-2 group-hover/box:right-2 transition-all duration-300" />
                <div className="relative w-full h-full bg-white/95 backdrop-blur-xl rounded-[14px] p-4 xs:p-5 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-wider sm:tracking-widest px-3 py-1 rounded-full shadow-md shadow-purple-500/20">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>AI ADVISORY CONTEXT</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider">
                      Action Required
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-indigo-950 font-bold text-sm xs:text-base sm:text-lg leading-relaxed break-words">
                      "3 tasks in <span className="underline decoration-purple-400 decoration-2 underline-offset-2 font-black text-purple-950">'Engineering'</span> are blocked by pending PR review. Resolving these dependencies will unblock 2 upcoming milestones."
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200/90 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                        Engineering
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/90 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        3 Pending PRs
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200/90 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        Unlocks 2 Milestones
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESIGNED FOR SERIOUS PRACTITIONERS ──────────────────────────────────── */}
      <section className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-10 text-center">
          <div className="space-y-3 max-w-3xl mx-auto scroll-reveal">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
              Designed for Serious Practitioners
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-semibold">
              Built for individuals who require structure, clarity, and verifiable output.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Students */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-500 via-indigo-400/50 to-slate-200/60 shadow-lg shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal delay-100">
              {/* Top Volumetric Glow Orb */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-16 bg-purple-500/25 blur-xl pointer-events-none group-hover:bg-purple-500/40 transition-all duration-500" />
              {/* Top Luminous Laser Beam */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-44 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              {/* Inner Card Surface */}
              <div className="relative h-full w-full bg-gradient-to-b from-purple-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                {/* Technical Index Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100/70 border border-purple-200 text-[10px] font-mono font-bold text-purple-700 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                  <span>AUDIENCE // 01</span>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🎓
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-xl xs:text-2xl font-black text-purple-950 break-words">Students</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold break-words">
                    Organize university coursework, engineering projects, skill learning, and academic portfolio evidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Engineers */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#20B5D6] via-blue-400/50 to-slate-200/60 shadow-lg shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal delay-200">
              {/* Top Volumetric Glow Orb */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-16 bg-[#20B5D6]/25 blur-xl pointer-events-none group-hover:bg-[#20B5D6]/40 transition-all duration-500" />
              {/* Top Luminous Laser Beam */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-44 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              {/* Inner Card Surface */}
              <div className="relative h-full w-full bg-gradient-to-b from-cyan-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                {/* Technical Index Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-100/70 border border-cyan-200 text-[10px] font-mono font-bold text-cyan-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20B5D6] animate-pulse" />
                  <span>AUDIENCE // 02</span>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <ZapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600" />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-xl xs:text-2xl font-black text-cyan-950 break-words">Engineers</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold break-words">
                    Connect code repositories, architecture deliverables, pull requests, and verified technical skills.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Builders */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-600 via-indigo-400/50 to-slate-200/60 shadow-lg shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal delay-300">
              {/* Top Volumetric Glow Orb */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-16 bg-blue-500/25 blur-xl pointer-events-none group-hover:bg-blue-500/40 transition-all duration-500" />
              {/* Top Luminous Laser Beam */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-44 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              {/* Inner Card Surface */}
              <div className="relative h-full w-full bg-gradient-to-b from-blue-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                {/* Technical Index Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 border border-blue-200 text-[10px] font-mono font-bold text-blue-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>AUDIENCE // 03</span>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🛠️
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-xl xs:text-2xl font-black text-blue-950 break-words">Builders</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold break-words">
                    Turn product ideas into structured workstreams, goals, milestones, and shipping schedules.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Career Growth */}
            <div className="relative group p-[2px] rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FE721D] via-amber-400/50 to-slate-200/60 shadow-lg shadow-orange-500/10 hover:shadow-2xl hover:shadow-orange-500/25 hover:-translate-y-2 transition-all duration-300 overflow-hidden scroll-reveal delay-400">
              {/* Top Volumetric Glow Orb */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-16 bg-[#FE721D]/25 blur-xl pointer-events-none group-hover:bg-[#FE721D]/40 transition-all duration-500" />
              {/* Top Luminous Laser Beam */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 group-hover:w-44 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none" />

              {/* Inner Card Surface */}
              <div className="relative h-full w-full bg-gradient-to-b from-orange-50/40 via-white to-white rounded-[14px] sm:rounded-[22px] p-4 xs:p-5 sm:p-6 md:p-8 flex flex-col items-center text-center space-y-3 sm:space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                {/* Technical Index Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100/70 border border-orange-200 text-[10px] font-mono font-bold text-orange-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE721D] animate-pulse" />
                  <span>AUDIENCE // 04</span>
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  🚀
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h3 className="text-xl xs:text-2xl font-black text-amber-950 break-words">Career Growth</h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-semibold break-words">
                    Track target roles, interview preparation, portfolio evidence, and skill-to-opportunity mapping.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="w-full relative bg-gradient-to-br from-cyan-50/60 via-white to-orange-50/60 py-16 sm:py-24 text-center overflow-hidden group scroll-reveal-scale">
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#20B5D6]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FE721D]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-14 space-y-8 relative z-10">
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
              Build your personal operating system.
            </h2>
            <p className="text-sm sm:text-xl text-slate-700 leading-relaxed font-semibold">
              Bring your strategic direction, daily execution, verified evidence, and career targets into one unified system.
            </p>
          </div>

          <div className="flex flex-row items-center justify-center gap-2 xs:gap-3 sm:gap-5 pt-4">
            {/* Button 1: Get Started Free */}
            <Link
              to="/login"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] shadow-lg sm:shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-3.5 xs:px-5 sm:px-9 py-2 xs:py-2.5 sm:py-4 rounded-sm bg-gradient-to-r from-[#20B5D6] via-[#1aa3c2] to-[#FE721D] text-white font-black text-[11px] xs:text-xs sm:text-base tracking-wide flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 overflow-hidden whitespace-nowrap">
                {/* Shimmer light pass */}
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                
                <span>Get Started Free</span>

                {/* Glowing Arrow Badge */}
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-sm bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-[#FE721D] group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-xs sm:text-sm">
                  →
                </span>
              </span>
            </Link>

            {/* Button 2: Sign In */}
            <Link
              to="/login"
              className="relative group/btn inline-flex items-center justify-center p-0.5 rounded-sm bg-gradient-to-r from-[#20B5D6] to-[#FE721D] shadow-md sm:shadow-lg shadow-cyan-500/10 hover:shadow-xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0"
            >
              <span className="relative px-3.5 xs:px-5 sm:px-9 py-2 xs:py-2.5 sm:py-4 rounded-sm bg-white/95 backdrop-blur-xl text-slate-900 group-hover/btn:text-[#20B5D6] font-black text-[11px] xs:text-xs sm:text-base tracking-wide flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 transition-colors duration-200 overflow-hidden whitespace-nowrap border border-slate-200">
                {/* Shimmer light pass */}
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[#20B5D6]/20 to-transparent pointer-events-none" />
                
                <span>Sign In</span>

                {/* Glowing User Icon Badge */}
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-sm bg-cyan-50 text-[#20B5D6] flex items-center justify-center group-hover/btn:bg-[#FE721D] group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
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
