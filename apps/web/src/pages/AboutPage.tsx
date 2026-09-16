import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap, RoadmapStep } from '../components/common/SerpentineRoadmap.js';

export const AboutPage: React.FC = () => {
  const rdSteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'PROBLEM DEFINITION',
      title: 'PINPOINT OPERATIONAL GAPS',
      subtitle: 'Identify Real Friction Before Coding.',
      description:
        'We analyze real-world operational fragmentation where academic coursework, engineering code, learning progress, and career opportunities exist in isolated silos.',
      focusAreas: [
        'Tool fragmentation analysis',
        'Academic & engineering workflow audits',
        'User pain point & bottleneck mapping',
        'Core system objective definition',
      ],
      themeColor: '#6366F1',
      bgBadgeColor: 'bg-indigo-50 border-indigo-200 text-[#6366F1]',
      badgeTextColor: 'text-[#6366F1]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'ARCHITECTURE',
      title: 'DESIGN & FORMULATE BLUEPRINTS',
      subtitle: 'Architect Clean Contracts & Data Schemas.',
      description:
        'Construct clear information architecture, PostgreSQL schemas, domain service contracts, and UI design systems prior to writing production code.',
      focusAreas: [
        'Domain model & database schema design',
        'REST API & controller specifications',
        'Google Roboto design system & UI tokens',
        'Deterministic state transition logic',
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
      badgeTitle: 'IMPLEMENTATION',
      title: 'BUILD MODULAR SOFTWARE',
      subtitle: 'Engineering Execution Without Superficial Decoration.',
      description:
        'Develop resilient Express services, React SPA pages, state management hooks, and background execution algorithms focused on core system utility.',
      focusAreas: [
        'TypeScript API & Vite SPA implementation',
        'Capacity & daily plan calculation engines',
        'Evidence logging & artifact mapping',
        'Argon2id auth & session management',
      ],
      themeColor: '#FF5A00',
      bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#FF5A00]',
      badgeTextColor: 'text-[#FF5A00]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      number: '04',
      badgeTitle: 'VERIFICATION',
      title: 'TEST & COLLECT PROOF',
      subtitle: 'Empirical Proof Before Declaring Success.',
      description:
        'Validate every feature using strict Vitest test suites, full TypeScript compilation checks, Vite production builds, and observable runtime evidence.',
      focusAreas: [
        'Automated API & Web Vitest test coverage',
        'Strict tsc type-checking & linting',
        'Production bundle optimization & audits',
        'Empirical log-based error diagnosis',
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
    {
      number: '05',
      badgeTitle: 'EVOLUTION',
      title: 'EVALUATE & CONTINUOUSLY EVOLVE',
      subtitle: 'Refine Architecture Based on Real Execution Data.',
      description:
        'Refine capacity assumptions, upgrade UI components, integrate AI advisory insights, and evolve product capabilities through continuous iterative feedback.',
      focusAreas: [
        'System state & capacity audit review',
        'Intelligence Core AI advisory optimization',
        'Component refactoring & design system polish',
        'Long-term product roadmap evolution',
      ],
      themeColor: '#A855F7',
      bgBadgeColor: 'bg-purple-50 border-purple-200 text-[#A855F7]',
      badgeTextColor: 'text-[#A855F7]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-20" id="about-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Product Philosophy &amp; Mission
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Designed to turn <span className="text-[#3B82F6]">ambition</span> into <span className="text-[#22C55E]">evidence</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          KENENISA OS was created to solve the fundamental problem of modern engineering and career fragmentation: connecting strategic direction, daily execution, verified proof, and long-term trajectory into one disciplined operating system.
        </p>
      </section>

      {/* ── THE MOTIVATION / FRAGMENTATION PROBLEM ──────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Why KENENISA OS Exists
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            The Fragmentation Problem
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-normal">
          <p>
            Modern engineers, students, and practitioners deal with high operational noise. Academic coursework sits in university portals; software engineering code lives in GitHub; task lists sit in personal todo apps; learning courses stay on tutorial sites; and career opportunities exist in scattered spreadsheets.
          </p>
          <p>
            This fragmentation creates artificial separation between <strong className="text-slate-900">what you intend to do</strong>, <strong className="text-slate-900">what you actually work on</strong>, and <strong className="text-slate-900">the verifiable proof of what you accomplished</strong>.
          </p>
          <p>
            KENENISA OS replaces fragmented tools with a single unified operating environment where every action contributes directly to strategic goals and verifiable evidence.
          </p>
        </div>
      </section>

      {/* ── PRODUCT PHILOSOPHY ─────────────────────────────────────────────────── */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Core Principles
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Product Philosophy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              Engineering Before Decoration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Focus on solving real operational problems with clean information architecture before adding superficial visual flair or trendy features.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              Evidence Before Assumptions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Decisions and progress claims must be backed by observable proof (commits, test passes, documents, deliverables) rather than arbitrary assertions.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
              Simplicity Before Complexity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Never introduce complicated workflows or heavy dependencies merely because they are fashionable. Maintain clear, simple execution pathways.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
              Human Agency Authoritative
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              AI serves strictly as an advisory intelligence layer. The user retains absolute authority over decisions, planning changes, and state mutations.
            </p>
          </div>
        </div>
      </section>

      {/* ── ENGINEERING R&D ROADMAP (SERPENTINE TIMELINE) ────────────────────────── */}
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

      {/* ── HUMAN + AI BOUNDARY ────────────────────────────────────────────────── */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Human + AI Advisory Collaboration</h3>
            <span className="text-[10px] font-bold text-[#A855F7] bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              Clear Boundary
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            AI should increase clarity, not remove human agency. In KENENISA OS, intelligence is strictly downstream of real system data.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap gap-2 items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Database System State</span>
            <span>&rarr;</span>
            <span className="text-[#3B82F6]">Context Extraction</span>
            <span>&rarr;</span>
            <span className="text-[#A855F7]">AI Reasoning</span>
            <span>&rarr;</span>
            <span className="text-amber-700">Advisory Recommendation</span>
            <span>&rarr;</span>
            <span className="text-[#22C55E]">Human Decision &amp; Action</span>
          </div>
        </div>
      </section>

      {/* ── PUBLIC VS PRIVATE BOUNDARY ────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 space-y-6 max-w-4xl mx-auto shadow-sm">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#3AB1EC] uppercase tracking-wider">
            Architecture Boundary
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Public Website vs Private Operating Environment
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
            <h4 className="font-bold text-[#3AB1EC]">Public Experience (Unauthenticated)</h4>
            <p className="text-slate-300 leading-relaxed font-normal">
              Communicates product methodology, system flow architecture, capabilities breakdown, and engineering philosophy without exposing private records or internal user state.
            </p>
          </div>

          <div className="space-y-2 bg-slate-800/80 p-5 rounded-xl border border-slate-700">
            <h4 className="font-bold text-[#22C55E]">Private Operating System (Authenticated)</h4>
            <p className="text-slate-300 leading-relaxed font-normal">
              Secure environment containing user workstreams, strategic goals, active tasks, capacity schedules, skill logs, career opportunity pipelines, evidence items, and intelligence advisory.
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <h3 className="text-xl font-bold text-slate-900">Ready to enter your personal operating environment?</h3>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all"
          >
            Get Started Now &rarr;
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>
    </div>
  );
};
