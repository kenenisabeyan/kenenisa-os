import React, { useState, useEffect } from 'react';
import { fetchHealth } from '../services/api.js';
import { formatUptime } from '../lib/dateTime.js';
import type { HealthData } from '@kenenisa-os/shared';

const MODULES = [
  {
    name: 'ASTU Academic Work',
    category: 'Academic',
    desc: 'Semester course tracking, assignments, exams, GPA math',
  },
  {
    name: 'Individual Final Project',
    category: 'Academic',
    desc: 'Research, milestones, deliverables & advisor reviews',
  },
  {
    name: 'Group Final Project',
    category: 'Academic',
    desc: 'Team task allocation, shared repository & sprint tracking',
  },
  {
    name: 'Full-Stack Engineering',
    category: 'Engineering',
    desc: 'Core web architecture, frontend, backend & API contracts',
  },
  {
    name: 'AI Engineering Learning',
    category: 'Engineering',
    desc: 'LLM fine-tuning, RAG systems, agents & paper implementations',
  },
  {
    name: 'EDOT Product Development',
    category: 'Career',
    desc: 'SaaS product roadmap, feature backlog & deployment analytics',
  },
  {
    name: 'Management Studies',
    category: 'Career',
    desc: 'Project management framework, agile practices & leadership',
  },
  {
    name: 'Freelancing & Consulting',
    category: 'Career',
    desc: 'Client pipeline, invoice tracking, delivery time & contracts',
  },
  {
    name: 'Personal Brand & Growth',
    category: 'Personal',
    desc: 'Technical writing, open-source impact, portfolio & resume',
  },
  {
    name: 'Productivity Analytics',
    category: 'Personal',
    desc: 'Time planning, task evidence, reviews & AI recommendations',
  },
];

export const PlaceholderPage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchHealth()
      .then((res) => {
        if (isMounted) {
          setHealth(res.data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'API standard error or server offline';
          setError(errorMessage);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header / Navbar - Fixed Position */}
      <header className="fixed top-0 inset-x-0 z-30 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              KENENISA OS
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold">
                v0.1.0-arch
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Personal 5th-Year Engineering & Career Operating System
            </p>
          </div>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${health ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
          </span>
          <span className="font-mono text-slate-700 font-semibold">
            {loading
              ? 'Checking API...'
              : health
                ? `API: ${health.status} (${formatUptime(health.uptime)})`
                : 'API: Connecting...'}
          </span>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20 shrink-0" aria-hidden="true" />

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <span>Step 1 Complete</span>
            <span>•</span>
            <span>Architecture Foundation Verified</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Engineering & Career Operating System
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
            Modular Monolith architecture with Express REST API, React 19, TypeScript, Zod
            validation, Pino logging, and Vitest test suite.
          </p>
        </div>

        {/* API Status Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-mono">
                API Baseline Status (`/api/v1/health`)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to express backend running on port 3000
              </p>
            </div>
            {error ? (
              <span className="text-xs font-mono text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-bold">
                ⚠️ {error}
              </span>
            ) : health ? (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="text-emerald-700 font-bold">Environment: {health.environment}</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-bold">Version: {health.version}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-medium">
                  Timestamp: {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-500 animate-pulse">
                Loading API status...
              </span>
            )}
          </div>
        </div>

        {/* Modular Architecture Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              System Modules
              <span className="text-xs font-mono text-slate-500 font-normal">
                (Target Capabilities)
              </span>
            </h3>
            <span className="text-xs font-mono text-blue-600 font-bold">10 Core Modules Planned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod, idx) => (
              <div
                key={idx}
                className="group relative bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {mod.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 group-hover:text-blue-600 transition-colors font-bold">
                      Module {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Architecture Ready</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500 font-mono">
        KENENISA OS — Advanced Monorepo Architecture Foundation Baseline
      </footer>
    </div>
  );
};
