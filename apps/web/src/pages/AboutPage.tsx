import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
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

      {/* ── ENGINEERING R&D APPROACH ────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            R&amp;D Methodology
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            The Engineering R&amp;D Approach
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            How features and methodologies in KENENISA OS are designed, tested, and established.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">1. Problem</span>
            <p className="font-bold text-slate-900">Define</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-[#3B82F6] font-bold uppercase">2. Question</span>
            <p className="font-bold text-[#3B82F6]">Analyze</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-[#6366F1] font-bold uppercase">3. Design</span>
            <p className="font-bold text-[#6366F1]">Architect</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-[#FF5A00] font-bold uppercase">4. Build</span>
            <p className="font-bold text-[#FF5A00]">Implement</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-[#22C55E] font-bold uppercase">5. Test</span>
            <p className="font-bold text-[#22C55E]">Verify</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-[#A855F7] font-bold uppercase">6. Evidence</span>
            <p className="font-bold text-[#A855F7]">Collect</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-amber-700 font-bold uppercase">7. Result</span>
            <p className="font-bold text-amber-700">Establish</p>
          </div>
        </div>
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
