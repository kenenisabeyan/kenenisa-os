import React from 'react';
import { Link } from 'react-router-dom';

export const CapabilitiesPage: React.FC = () => {
  return (
    <div className="space-y-20" id="capabilities-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          System Capabilities
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Built for <span className="text-[#3B82F6]">engineering precision</span> and real execution.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Explore the core modular components of KENENISA OS. Each capability works independently while sharing state across the entire operating system.
        </p>
      </section>

      {/* ── SYSTEM CONNECTION MAP ──────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Connected Architecture
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interconnected System Map
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            No isolated silos. Information flows seamlessly between operational modules.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#3B82F6]">Execution</span>
            <p className="text-[10px] text-slate-500 font-normal">Workstreams &amp; Tasks</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#3AB1EC]">Planning</span>
            <p className="text-[10px] text-slate-500 font-normal">Capacity &amp; Schedule</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#6366F1]">Learning</span>
            <p className="text-[10px] text-slate-500 font-normal">Skills &amp; Practice</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#22C55E]">Evidence</span>
            <p className="text-[10px] text-slate-500 font-normal">Proof &amp; Vault</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-amber-700">Career</span>
            <p className="text-[10px] text-slate-500 font-normal">Pipeline &amp; Prep</p>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-[#A855F7]">Intelligence</span>
            <p className="text-[10px] text-slate-500 font-normal">Advisory Layer</p>
          </div>
        </div>
      </section>

      {/* ── CAPABILITY GROUPS DETAIL ────────────────────────────────────────────── */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Detailed Breakdown
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Core Operating Capabilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Execution Engine */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <h3 className="text-base font-bold text-slate-900">Execution Engine</h3>
              </div>
              <span className="text-[10px] font-bold text-[#3B82F6] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Core Module
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Structured hierarchy for organizing work. High-level Workstreams break down into strategic Goals, multi-stage Projects, sequential Milestones, and actionable Tasks with strict dependency ordering.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-[#3B82F6]">
                <li><span className="text-slate-700">Strict P0 / P1 / P2 Priority levels</span></li>
                <li><span className="text-slate-700">Task dependency graphs &amp; blocker tracking</span></li>
                <li><span className="text-slate-700">Project milestone completion tracking</span></li>
              </ul>
            </div>
          </div>

          {/* Planning & Capacity */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3AB1EC]" />
                <h3 className="text-base font-bold text-slate-900">Capacity &amp; Schedule Planning</h3>
              </div>
              <span className="text-[10px] font-bold text-[#3AB1EC] bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                Planning
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Realistic daily capacity matching. Map available time blocks against estimated task effort to prevent overload, identify scheduling conflicts, and maintain steady execution velocity.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-[#3AB1EC]">
                <li><span className="text-slate-700">Daily available hours budget vs task estimates</span></li>
                <li><span className="text-slate-700">Time-blocking schedule grid</span></li>
                <li><span className="text-slate-700">Conflict &amp; overcommitment alerts</span></li>
              </ul>
            </div>
          </div>

          {/* Skill Development */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                <h3 className="text-base font-bold text-slate-900">Learning &amp; Skill Development</h3>
              </div>
              <span className="text-[10px] font-bold text-[#6366F1] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Capability
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Track course progress, technical reading, certifications, and target skills. Link skill practice directly to active software projects for real-world application.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-[#6366F1]">
                <li><span className="text-slate-700">Skill verification levels (Beginner &rarr; Expert)</span></li>
                <li><span className="text-slate-700">Learning resource linking &amp; progress logging</span></li>
                <li><span className="text-slate-700">Direct integration with project execution</span></li>
              </ul>
            </div>
          </div>

          {/* Evidence Vault */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <h3 className="text-base font-bold text-slate-900">Evidence Vault &amp; Proof</h3>
              </div>
              <span className="text-[10px] font-bold text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verification
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Store concrete artifacts proving task and project completions. Keep pull request links, technical documentation, deployed sites, and test verification output in one verifiable vault.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-[#22C55E]">
                <li><span className="text-slate-700">Observable proof item repository</span></li>
                <li><span className="text-slate-700">Verification URL &amp; artifact metadata tracking</span></li>
                <li><span className="text-slate-700">Weekly review reflection attachments</span></li>
              </ul>
            </div>
          </div>

          {/* Opportunity Pipeline */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Career Opportunity Pipeline</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Career
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Manage target job roles, academic applications, and client proposals. Map required role skills against verified evidence items to identify gaps and target interview preparation.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-amber-700">
                <li><span className="text-slate-700">Opportunity stage pipeline (Target &rarr; Applied &rarr; Offer)</span></li>
                <li><span className="text-slate-700">Skill gap analysis against job descriptions</span></li>
                <li><span className="text-slate-700">Evidence portfolio matching per application</span></li>
              </ul>
            </div>
          </div>

          {/* Intelligence Core */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7]" />
                <h3 className="text-base font-bold text-slate-900">Intelligence Core (AI Advisory)</h3>
              </div>
              <span className="text-[10px] font-bold text-[#A855F7] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Advisory layer reasoning over system state. Analyzes task progress, capacity conflicts, and evidence gaps to recommend high-impact actions while keeping human agency authoritative.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 font-medium">
              <p className="text-[11px] font-bold text-slate-900 uppercase">Key Features:</p>
              <ul className="list-disc pl-4 space-y-1 font-normal text-[#A855F7]">
                <li><span className="text-slate-700">Deterministic Next Best Action recommendation</span></li>
                <li><span className="text-slate-700">Contextual system state reasoning</span></li>
                <li><span className="text-slate-700">Human confirmation for all state mutations</span></li>
              </ul>
            </div>
          </div>
        </div>
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
