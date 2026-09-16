import React from 'react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="space-y-20" id="how-it-works-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Methodology & System Flow
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          From <span className="text-[#3B82F6]">intention</span> to <span className="text-[#22C55E]">evidence</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          KENENISA OS transforms high-level strategic direction into structured, executable work, daily capacity planning, and verifiable output.
        </p>
      </section>

      {/* ── THE 7-STEP OPERATING METHODOLOGY ──────────────────────────────────── */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Operating Methodology
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            The 7-Step Operating Lifecycle
          </h2>
          <p className="text-xs text-slate-500 font-normal max-w-xl mx-auto">
            How ambition becomes executable reality without dropping priorities or losing proof.
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#3B82F6] font-bold text-sm shrink-0">
              01
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 1 — Define Direction</h3>
                <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Strategy
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Establish high-level Workstreams (e.g., Engineering OS, University Academic Research, Career Growth) and set clear Goals with target target dates. Ask: What matters? Why does it matter? Where am I going?
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#3B82F6]">
                Input: Ambition &amp; Focus Areas &rarr; Output: Defined Workstreams &amp; Strategic Goals
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#6366F1] font-bold text-sm shrink-0">
              02
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 2 — Structure the Work</h3>
                <span className="text-[10px] font-bold uppercase text-[#6366F1] bg-indigo-50 px-2 py-0.5 rounded">
                  Decomposition
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Break large goals into executable Projects, sequential Milestones, and individual Tasks with strict priority levels (P0 Critical, P1 High, P2 Normal).
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 flex flex-wrap gap-2 items-center">
                <span>Workstream</span> &rarr; <span>Goal</span> &rarr; <span>Project</span> &rarr; <span>Milestone</span> &rarr; <span>Task</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#3AB1EC] font-bold text-sm shrink-0">
              03
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 3 — Plan Capacity</h3>
                <span className="text-[10px] font-bold uppercase text-[#3AB1EC] bg-cyan-50 px-2 py-0.5 rounded">
                  Capacity Matching
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Match required tasks against real available daily and weekly time capacity. Prevent overcommitment by distinguishing estimated effort from scheduled time slots.
              </p>
              <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                Core Principle: Estimated Effort &ne; Scheduled Time Block &ne; Actual Elapsed Time.
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF5A00] font-bold text-sm shrink-0">
              04
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 4 — Execute via Next Best Action</h3>
                <span className="text-[10px] font-bold uppercase text-[#FF5A00] bg-orange-50 px-2 py-0.5 rounded">
                  Execution
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Execute using deterministic prioritization. Next Best Action selects unblocked tasks based on strategic goal priority, deadlines, dependency chains, and available time slots.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#22C55E] font-bold text-sm shrink-0">
              05
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 5 — Produce Observable Evidence</h3>
                <span className="text-[10px] font-bold uppercase text-[#22C55E] bg-emerald-50 px-2 py-0.5 rounded">
                  Verification
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Task completion generates observable proof items—such as pull request URLs, published docs, repository commits, test pass rates, or project artifacts—stored in the Evidence Vault.
              </p>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#A855F7] font-bold text-sm shrink-0">
              06
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 6 — Weekly &amp; Periodic Review</h3>
                <span className="text-[10px] font-bold uppercase text-[#A855F7] bg-purple-50 px-2 py-0.5 rounded">
                  Reflection
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Review weekly velocity, completed evidence, capacity accuracy, and blockages. Reflect on what happened, what changed, what was blocked, and what lessons were learned.
              </p>
            </div>
          </div>

          {/* Step 7 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
              07
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Step 7 — Continuous System Improvement</h3>
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Evolution
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Use reflection insight to update capacity assumptions, refine goal milestones, update skill levels, and adjust future execution plans in a continuous feedback loop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENGINEERING R&D PHILOSOPHY ─────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2 text-center">
          <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-wider">
            Engineering R&amp;D Discipline
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Think Like an Engineer
          </h2>
          <p className="text-xs text-slate-500 font-normal max-w-xl mx-auto">
            KENENISA OS applies scientific rigor and software engineering principles to personal skill building and career progression.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Problem</span>
            <p className="font-bold text-slate-900">Identify Gap</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase">2. Question</span>
            <p className="font-bold text-[#3B82F6]">Hypothesize</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-[#6366F1] uppercase">3. Design</span>
            <p className="font-bold text-[#6366F1]">Architecture</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-[#FF5A00] uppercase">4. Build</span>
            <p className="font-bold text-[#FF5A00]">Implementation</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-[#22C55E] uppercase">5. Verification</span>
            <p className="font-bold text-[#22C55E]">Evidence</p>
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────────── */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4">
        <h3 className="text-xl font-bold text-slate-900">Ready to examine the full system capabilities?</h3>
        <div className="flex justify-center gap-4">
          <Link
            to="/capabilities"
            className="px-6 py-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all"
          >
            Explore System Capabilities &rarr;
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
