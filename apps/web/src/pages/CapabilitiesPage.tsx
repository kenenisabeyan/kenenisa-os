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
      bgBadgeColor: 'bg-indigo-50 border-indigo-200 text-[#6366F1]',
      badgeTextColor: 'text-[#6366F1]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
      themeColor: '#FFD700',
      bgBadgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
      badgeTextColor: 'text-amber-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
    <div className="space-y-20" id="capabilities-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          System Capabilities Architecture
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Built for <span className="text-[#3B82F6]">engineering precision</span> and real execution.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Explore the core modular components of KENENISA OS. Each capability works independently while sharing state across the entire operating system.
        </p>
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
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Data Ownership &amp; Security
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Security &amp; Privacy Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Isolated Private Operating Context</h4>
            <p className="text-slate-600 leading-relaxed font-normal">
              All personal tasks, goals, project artifacts, and evidence reside behind strict authenticated sessions. Public pages never expose private user data.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Human-In-The-Loop AI</h4>
            <p className="text-slate-600 leading-relaxed font-normal">
              Intelligence Core acts strictly as an advisory layer. The system will never mutate tasks, delete projects, or send external data without explicit human confirmation.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Authoritative System State</h4>
            <p className="text-slate-600 leading-relaxed font-normal">
              Your PostgreSQL database state is the single source of truth. AI reasoning is transient and downstream from verified database state.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <h3 className="text-xl font-bold text-slate-900">Ready to start using these capabilities?</h3>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all"
          >
            Get Started &rarr;
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
          >
            About KENENISA OS
          </Link>
        </div>
      </section>
    </div>
  );
};
