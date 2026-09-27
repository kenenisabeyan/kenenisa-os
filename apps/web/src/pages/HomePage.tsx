import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const homeLoopSteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'DIRECTION & TARGETS',
      title: 'DEFINE STRATEGIC DIRECTION',
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
      title: 'STRUCTURE PROJECTS & TASKS',
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
      title: 'PLAN CAPACITY & TIME BLOCKS',
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
      title: 'EXECUTE VIA NEXT BEST ACTION',
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
      title: 'PRODUCE EVIDENCE & ADVANCE CAREER',
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
    <div className="space-y-24 py-6" id="public-home-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 sm:space-y-10 max-w-[1720px] mx-auto pt-6 px-1">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-cyan-50/90 via-sky-50/90 to-blue-50/90 border-2 border-cyan-200/90 text-cyan-900 text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest shadow-md shadow-cyan-500/10 hover:scale-105 transition-all duration-300 max-w-[90vw] mx-auto">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="truncate">Personal Engineering &amp; Career OS</span>
          <span className="text-cyan-500 shrink-0">⚡</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-indigo-950 tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Turn your direction into a{' '}
          <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">system of execution</span>.
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-xl lg:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-semibold">
          KENENISA OS connects goals, projects, tasks, daily capacity planning, learning, concrete evidence, and career opportunities into one unified personal operating environment.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
          {/* Button 1: Get Started Free */}
          <Link
            to="/login"
            className="relative group w-full sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-base tracking-wide flex items-center justify-center gap-3 overflow-hidden">
              {/* Shimmer light pass */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              
              <span>Get Started Free</span>

              {/* Glowing Arrow Badge */}
              <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-sm">
                →
              </span>
            </span>
          </Link>

          {/* Button 2: Explore How It Works */}
          <Link
            to="/how-it-works"
            className="relative group w-full sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-9 py-4 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 group-hover:text-cyan-700 font-black text-base tracking-wide flex items-center justify-center gap-3 transition-colors duration-200 overflow-hidden">
              {/* Shimmer light pass */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none" />
              
              <span>Explore How It Works</span>

              {/* Glowing Compass/Play Icon Badge */}
              <span className="w-7 h-7 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </Link>
        </div>

        {/* System Architecture Bar */}
        <div className="pt-8 sm:pt-10 max-w-[1720px] mx-auto">
          {/* 7-Step Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5 sm:gap-4 relative z-10">
            {/* Step 1 */}
            <Link
              to="/workstreams"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-indigo-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-indigo-300 group-hover/step:shadow-indigo-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-indigo-600 transition-colors">
                  Workstreams
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Strategic Direction &amp; Workstreams
                </p>
              </div>
            </Link>

            {/* Step 2 */}
            <Link
              to="/goals"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-blue-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-blue-300 group-hover/step:shadow-blue-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  <circle cx="12" cy="12" r="4" strokeWidth={2} />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-cyan-600 transition-colors">
                  Goals
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Measurable Target Objectives
                </p>
              </div>
            </Link>

            {/* Step 3 */}
            <Link
              to="/projects"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-purple-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-purple-300 group-hover/step:shadow-purple-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-purple-600 transition-colors">
                  Projects
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Structured Project Modules
                </p>
              </div>
            </Link>

            {/* Step 4 */}
            <Link
              to="/tasks"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-amber-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-amber-300 group-hover/step:shadow-amber-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-amber-600 transition-colors">
                  Tasks
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Actionable Daily Capacity Tasks
                </p>
              </div>
            </Link>

            {/* Step 5 */}
            <Link
              to="/evidence"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-emerald-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-emerald-300 group-hover/step:shadow-emerald-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-emerald-600 transition-colors">
                  Evidence
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Observable Digital Proof Vault
                </p>
              </div>
            </Link>

            {/* Step 6 */}
            <Link
              to="/reflection"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-rose-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px]"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-rose-300 group-hover/step:shadow-rose-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-rose-600 transition-colors">
                  Reflect
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Continuous System Reflection
                </p>
              </div>
            </Link>

            {/* Step 7 */}
            <Link
              to="/career"
              className="relative group/step bg-white/95 backdrop-blur-md border-2 border-indigo-100 hover:border-sky-400 rounded-2xl p-5 text-center shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between min-h-[160px] col-span-2 sm:col-span-1 lg:col-span-1"
            >
              {/* Centered Squircle Icon Box */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-indigo-100 shadow-md flex items-center justify-center mx-auto mb-2 p-3 group-hover/step:scale-110 group-hover/step:border-sky-300 group-hover/step:shadow-sky-500/20 transition-all duration-300">
                <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              {/* Title & Subtitle */}
              <div className="space-y-1 text-center w-full">
                <h3 className="font-black text-sm sm:text-base text-indigo-950 group-hover/step:text-sky-600 transition-colors">
                  Career
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight">
                  Verified Trajectory &amp; Growth
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HIGH-IMPACT SERPENTINE ROADMAP JOURNEY ──────────────────────────────── */}
      <section>
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
      <section className="space-y-10 max-w-[1720px] mx-auto">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-black text-rose-600 bg-rose-50 border border-rose-200/90 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            CHALLENGE &amp; SOLUTION
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
            The Problem: Fragmented Execution
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
            Academic courses, software projects, skill learning, job applications, and personal goals often exist as disconnected silos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Disconnected Workflow */}
          <div className="relative rounded-3xl bg-gradient-to-br from-rose-50/90 via-rose-100/40 to-orange-50/60 p-8 sm:p-10 border-2 border-rose-200/90 shadow-2xl shadow-rose-500/10 space-y-6 transition-all duration-300 hover:shadow-rose-500/20 hover:border-rose-300 group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-orange-500" />
            
            <div className="flex items-center justify-between pb-4 border-b border-rose-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-rose-500/40 shrink-0">
                  ✕
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
                  Traditional Disconnected Workflow
                </h3>
              </div>
              <span className="text-[10px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-3 py-1 rounded-full uppercase tracking-widest">
                Fragmented
              </span>
            </div>

            <ul className="space-y-4 text-base sm:text-lg text-rose-950 font-semibold">
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                <span>Tasks sit in one app while code pull requests sit in GitHub.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                <span>Courses and certifications are logged separately from active engineering projects.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                <span>Career opportunities lack observable evidence connecting them to completed work.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✕</div>
                <span>Daily planning is disconnected from long-term strategic direction.</span>
              </li>
            </ul>
          </div>

          {/* The KENENISA OS Operating System */}
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-100/40 to-cyan-50/60 p-8 sm:p-10 border-2 border-emerald-200/90 shadow-2xl shadow-emerald-500/10 space-y-6 transition-all duration-300 hover:shadow-emerald-500/20 hover:border-emerald-300 group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />

            <div className="flex items-center justify-between pb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-emerald-500/40 shrink-0">
                  ✓
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                  The KENENISA OS Operating System
                </h3>
              </div>
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-widest">
                Unified Loop
              </span>
            </div>

            <ul className="space-y-4 text-base sm:text-lg text-emerald-950 font-semibold">
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                <span>Goals directly break down into projects, milestones, and executable tasks.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                <span>Task completions automatically produce observable evidence items.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                <span>Verified skills link directly to completed project artifacts and target opportunities.</span>
              </li>
              <li className="flex items-start gap-3.5 bg-white/80 p-3.5 rounded-2xl border border-emerald-200/80 shadow-xs group-hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">✓</div>
                <span>Deterministic Next Best Action guides daily capacity execution.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CORE ENGINEERING CONCEPT SECTION ───────────────────────────────────── */}
      <section className="space-y-10 text-center max-w-[1720px] mx-auto py-6">
        <div className="max-w-3xl mx-auto space-y-3 relative z-10">
          <span className="inline-flex items-center gap-2 text-xs font-black text-cyan-900 bg-cyan-100/90 border border-cyan-300 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            CORE ENGINEERING CONCEPT
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
            One Activity. Multiple Outcomes.
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
            When you complete an engineering task in KENENISA OS, it simultaneously advances multiple strategic areas without redundant manual logging.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5 relative z-10">
          {/* Academic */}
          <div className="relative p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl space-y-3 shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Academic</span>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">Coursework &amp; Research</p>
            </div>
          </div>

          {/* Engineering */}
          <div className="relative p-6 bg-gradient-to-br from-purple-600 to-indigo-800 text-white rounded-2xl space-y-3 shadow-xl shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Engineering</span>
              <p className="text-xs sm:text-sm text-purple-100 font-medium">Software &amp; Architecture</p>
            </div>
          </div>

          {/* Skill Gain */}
          <div className="relative p-6 bg-gradient-to-br from-violet-600 to-fuchsia-700 text-white rounded-2xl space-y-3 shadow-xl shadow-violet-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Skill Gain</span>
              <p className="text-xs sm:text-sm text-violet-100 font-medium">Verified Capabilities</p>
            </div>
          </div>

          {/* Evidence */}
          <div className="relative p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl space-y-3 shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Evidence</span>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">Proof of Output</p>
            </div>
          </div>

          {/* Portfolio */}
          <div className="relative p-6 bg-gradient-to-br from-cyan-600 to-sky-700 text-white rounded-2xl space-y-3 shadow-xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Portfolio</span>
              <p className="text-xs sm:text-sm text-cyan-100 font-medium">Tangible Artifacts</p>
            </div>
          </div>

          {/* Career Value */}
          <div className="relative p-6 bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-2xl space-y-3 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 group/item overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black block">Career Value</span>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">Opportunity Pipeline</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMAND CENTER PREVIEW ───────────────────────────────────────────────── */}
      <section className="space-y-8 max-w-[1720px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-extrabold text-[#0284C7] uppercase tracking-widest block mb-1">
              OPERATIONAL COMMAND
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight">
              Command Center &amp; Intelligence Core
            </h2>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-cyan-500/25 hover:scale-105 hover:shadow-cyan-500/40 transition-all duration-300 shrink-0 group"
          >
            <span>Launch Command Center</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deterministic Next Best Action Card */}
          <div className="relative bg-gradient-to-br from-cyan-50/90 via-sky-50/70 to-blue-100/80 rounded-3xl p-8 space-y-6 shadow-2xl shadow-cyan-500/10 border-2 border-cyan-200/90 transition-all duration-300 hover:border-cyan-300 hover:shadow-cyan-500/20 overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/25 transition-all duration-500" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />

            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-cyan-200/80">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 animate-pulse" />
                Deterministic Next Best Action
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-cyan-300 shadow-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                System Derived
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              Instead of guessing what to work on next, the system analyzes open priorities (P0/P1), unblocked task dependencies, and scheduled capacity to recommend your exact next engineering task.
            </p>

            {/* Inner Recommendation Box */}
            <div className="relative bg-white/95 backdrop-blur-xl border-2 border-cyan-300/80 p-6 rounded-2xl space-y-4 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group/box overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />
              
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
                <p className="font-black text-lg sm:text-xl text-indigo-950 group-hover/box:text-cyan-700 transition-colors">
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

          {/* AI Advisory Layer Card */}
          <div className="relative bg-gradient-to-br from-purple-50/90 via-fuchsia-50/70 to-indigo-100/80 rounded-3xl p-8 space-y-6 shadow-2xl shadow-purple-500/10 border-2 border-purple-200/90 transition-all duration-300 hover:border-purple-300 hover:shadow-purple-500/20 overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-400/25 transition-all duration-500" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600" />

            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-purple-200/80">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-950 flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 animate-pulse" />
                AI Advisory Layer
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-900 bg-white/90 px-3.5 py-1.5 rounded-full border border-purple-300 shadow-sm uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                AI Advisory
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              Intelligence Core acts as an advisory mentor over your system state. It analyzes work structure, identifies blockers, and provides actionable recommendations while keeping human decision-making authoritative.
            </p>

            {/* Inner Advisory Context Box */}
            <div className="relative bg-white/95 backdrop-blur-xl border-2 border-purple-300/80 p-6 rounded-2xl space-y-4 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 group/box overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-600" />
              
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
                <p className="text-indigo-950 font-bold text-base sm:text-lg leading-relaxed">
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
      </section>

      {/* ── DESIGNED FOR SERIOUS PRACTITIONERS ──────────────────────────────────── */}
      <section className="space-y-10 max-w-[1720px] mx-auto">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-black text-purple-900 bg-purple-100/90 border border-purple-300 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            TARGET AUDIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-indigo-950 tracking-tight">
            Designed for Serious Practitioners
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-semibold">
            Built for individuals who require structure, clarity, and verifiable output.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students */}
          <div className="relative bg-gradient-to-br from-purple-50/90 via-indigo-50/60 to-white border-2 border-purple-200/90 rounded-3xl p-8 space-y-4 shadow-xl shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 group overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-600" />
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🎓
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-purple-950">Students</h3>
              <p className="text-base text-slate-700 leading-relaxed font-semibold">
                Organize university coursework, engineering projects, skill learning, and academic portfolio evidence.
              </p>
            </div>
          </div>

          {/* Engineers */}
          <div className="relative bg-gradient-to-br from-cyan-50/90 via-blue-50/60 to-white border-2 border-cyan-200/90 rounded-3xl p-8 space-y-4 shadow-xl shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 group overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-600" />
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-cyan-950">Engineers</h3>
              <p className="text-base text-slate-700 leading-relaxed font-semibold">
                Connect code repositories, architecture deliverables, pull requests, and verified technical skills.
              </p>
            </div>
          </div>

          {/* Builders */}
          <div className="relative bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white border-2 border-blue-200/90 rounded-3xl p-8 space-y-4 shadow-xl shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 group overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🛠️
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-blue-950">Builders</h3>
              <p className="text-base text-slate-700 leading-relaxed font-semibold">
                Turn product ideas into structured workstreams, goals, milestones, and shipping schedules.
              </p>
            </div>
          </div>

          {/* Career Growth */}
          <div className="relative bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-white border-2 border-amber-200/90 rounded-3xl p-8 space-y-4 shadow-xl shadow-amber-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 group overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🚀
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-amber-950">Career Growth</h3>
              <p className="text-base text-slate-700 leading-relaxed font-semibold">
                Track target roles, interview preparation, portfolio evidence, and skill-to-opportunity mapping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-cyan-50/90 border-2 border-indigo-200/90 p-10 sm:p-16 text-center space-y-8 shadow-2xl shadow-purple-500/10 max-w-[1720px] mx-auto overflow-hidden group">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" />
        
        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />

        <div className="space-y-4 max-w-3xl mx-auto relative z-10">
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-tight text-indigo-950">
            Build your personal operating system.
          </h2>
          <p className="text-sm sm:text-xl text-slate-700 leading-relaxed font-semibold">
            Bring your strategic direction, daily execution, verified evidence, and career targets into one unified system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 relative z-10">
          {/* Button 1: Get Started Free */}
          <Link
            to="/login"
            className="relative group/btn w-full sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-9 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-base tracking-wide flex items-center justify-center gap-3 overflow-hidden">
              {/* Shimmer light pass */}
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
              
              <span>Get Started Free</span>

              {/* Glowing Arrow Badge */}
              <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-blue-600 group-hover/btn:translate-x-1 transition-all duration-300 shadow-sm shrink-0 font-bold text-sm">
                →
              </span>
            </span>
          </Link>

          {/* Button 2: Sign In */}
          <Link
            to="/login"
            className="relative group/btn w-full sm:w-auto inline-flex items-center justify-center p-0.5 rounded-full bg-gradient-to-r from-purple-300 via-indigo-400 to-cyan-300 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <span className="relative w-full sm:w-auto px-9 py-4 rounded-full bg-white/95 backdrop-blur-xl text-indigo-950 group-hover/btn:text-purple-700 font-black text-base tracking-wide flex items-center justify-center gap-3 transition-colors duration-200 overflow-hidden">
              {/* Shimmer light pass */}
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent pointer-events-none" />
              
              <span>Sign In</span>

              {/* Glowing User Icon Badge */}
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-all duration-300 shadow-sm shrink-0">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
};
