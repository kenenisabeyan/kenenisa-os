import React from 'react';
import { Link } from 'react-router-dom';
import { SerpentineRoadmap } from '../components/common/SerpentineRoadmap.js';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="space-y-20" id="how-it-works-page">
      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#3B82F6] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          Methodology &amp; System Flow Architecture
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          From <span className="text-[#3B82F6]">intention</span> to <span className="text-[#22C55E]">verifiable evidence</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          KENENISA OS transforms high-level strategic direction into structured, executable work, capacity-matched daily planning, observable proof, and continuous career growth.
        </p>
      </section>

      {/* ── THE SERPENTINE ENGINEERING ROADMAP (HIGH-IMPACT VISUAL) ──────────────── */}
      <section>
        <SerpentineRoadmap />
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
