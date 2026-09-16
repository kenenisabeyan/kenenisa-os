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
      themeColor: '#6366F1',
      bgBadgeColor: 'bg-indigo-50 border-indigo-200 text-[#6366F1]',
      badgeTextColor: 'text-[#6366F1]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
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
      themeColor: '#3B82F6',
      bgBadgeColor: 'bg-blue-50 border-blue-200 text-[#3B82F6]',
      badgeTextColor: 'text-[#3B82F6]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
      themeColor: '#3AB1EC',
      bgBadgeColor: 'bg-cyan-50 border-cyan-200 text-[#3AB1EC]',
      badgeTextColor: 'text-[#3AB1EC]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      themeColor: '#FF5A00',
      bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#FF5A00]',
      badgeTextColor: 'text-[#FF5A00]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
      themeColor: '#22C55E',
      bgBadgeColor: 'bg-emerald-50 border-emerald-200 text-[#22C55E]',
      badgeTextColor: 'text-[#22C55E]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-20" id="public-home-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Personal Engineering &amp; Career Operating System
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Turn your direction into a <span className="text-[#3B82F6]">system of execution</span>.
        </h1>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          KENENISA OS connects goals, projects, tasks, daily capacity planning, learning, concrete evidence, and career opportunities into one unified personal operating environment.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 text-center"
          >
            Get Started Free →
          </Link>
          <Link
            to="/how-it-works"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-xs transition-all text-center"
          >
            Explore How It Works
          </Link>
        </div>

        {/* System Architecture Bar */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900">System Flow Architecture</span>
              <span className="text-[#3AB1EC] font-semibold">Continuous Operating Loop</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">1. Direction</span>
                <p className="font-bold text-slate-900">Workstreams</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#3B82F6] uppercase">2. Target</span>
                <p className="font-bold text-[#3B82F6]">Goals</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#6366F1] uppercase">3. Structure</span>
                <p className="font-bold text-[#6366F1]">Projects</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#FF5A00] uppercase">4. Action</span>
                <p className="font-bold text-[#FF5A00]">Tasks</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#22C55E] uppercase">5. Proof</span>
                <p className="font-bold text-[#22C55E]">Evidence</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#A855F7] uppercase">6. Review</span>
                <p className="font-bold text-[#A855F7]">Reflect</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold text-[#FFD700] uppercase">7. Growth</span>
                <p className="font-bold text-amber-700">Career</p>
              </div>
            </div>
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

      {/* ── PROBLEM SECTION ──────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            The Problem: Fragmented Execution
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Academic courses, software projects, skill learning, job applications, and personal goals often exist as disconnected silos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-rose-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold text-rose-900">Traditional Disconnected Workflow</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed font-normal">
              <li>Tasks sit in one app while code pull requests sit in GitHub.</li>
              <li>Courses and certifications are logged separately from active engineering projects.</li>
              <li>Career opportunities lack observable evidence connecting them to completed work.</li>
              <li>Daily planning is disconnected from long-term strategic direction.</li>
            </ul>
          </div>

          <div className="bg-white border border-emerald-200/90 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <h3 className="text-sm font-bold text-emerald-900">The KENENISA OS Operating System</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed font-normal">
              <li>Goals directly break down into projects, milestones, and executable tasks.</li>
              <li>Task completions automatically produce observable evidence items.</li>
              <li>Verified skills link directly to completed project artifacts and target opportunities.</li>
              <li>Deterministic Next Best Action guides daily capacity execution.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CORE IDEA SECTION ────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Core Engineering Concept
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            One Activity. Multiple Outcomes.
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            When you complete an engineering task in KENENISA OS, it simultaneously advances multiple strategic areas without redundant manual logging.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-semibold">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[#3B82F6]">Academic</span>
            <p className="text-[11px] text-slate-500 font-normal">Coursework &amp; Research</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[#6366F1]">Engineering</span>
            <p className="text-[11px] text-slate-500 font-normal">Software &amp; Architecture</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[#A855F7]">Skill Gain</span>
            <p className="text-[11px] text-slate-500 font-normal">Verified Capabilities</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[#22C55E]">Evidence</span>
            <p className="text-[11px] text-slate-500 font-normal">Proof of Output</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[#3AB1EC]">Portfolio</span>
            <p className="text-[11px] text-slate-500 font-normal">Tangible Artifacts</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-amber-700">Career Value</span>
            <p className="text-[11px] text-slate-500 font-normal">Opportunity Pipeline</p>
          </div>
        </div>
      </section>

      {/* ── COMMAND CENTER PREVIEW ───────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
              Operational Command
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Command Center &amp; Intelligence Core
            </h2>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-[#3B82F6] hover:underline"
          >
            Launch Command Center →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Deterministic Next Best Action</h3>
              <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                System Derived
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Instead of guessing what to work on next, the system analyzes open priorities (P0/P1), unblocked task dependencies, and scheduled capacity to recommend your exact next engineering task.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#3B82F6] uppercase">Example Recommendation</span>
              <p className="font-semibold text-slate-900">KENENISA OS Planning Engine Pull Request</p>
              <p className="text-[11px] text-slate-500 font-normal">Workstream: Engineering OS &bull; Priority: P0 Critical</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">AI Advisory Layer</h3>
              <span className="text-[10px] font-bold text-[#7e22ce] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                AI Advisory
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Intelligence Core acts as an advisory mentor over your system state. It analyzes work structure, identifies blockers, and provides actionable recommendations while keeping human decision-making authoritative.
            </p>
            <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200 text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#7e22ce] uppercase">[AI Advisory Context]</span>
              <p className="text-slate-800 font-normal">
                "3 tasks in 'Engineering' are blocked by pending PR review. Resolving these dependencies will unblock 2 upcoming milestones."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO IT IS FOR ────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Designed for Serious Practitioners
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Built for individuals who require structure, clarity, and verifiable output.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Students</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Organize university coursework, engineering projects, skill learning, and academic portfolio evidence.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Engineers</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Connect code repositories, architecture deliverables, pull requests, and verified technical skills.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Builders</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Turn product ideas into structured workstreams, goals, milestones, and shipping schedules.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">Career Growth</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Track target roles, interview preparation, portfolio evidence, and skill-to-opportunity mapping.
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm max-w-4xl mx-auto">
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Build your personal operating system.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Bring your strategic direction, daily execution, verified evidence, and career targets into one unified system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 text-center"
          >
            Get Started →
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
};
