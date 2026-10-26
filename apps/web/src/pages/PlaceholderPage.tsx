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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Header / Navbar - Fixed Position */}
      <header className="fixed top-0 inset-x-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              KENENISA OS
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                v0.1.0-arch
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Personal 5th-Year Engineering & Career Operating System
            </p>
          </div>
        </div>

        {/* Live System Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${health ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
          </span>
          <span className="font-mono text-slate-300">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
            <span>Step 1 Complete</span>
            <span>•</span>
            <span>Architecture Foundation Verified</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Engineering & Career Operating System
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Modular Monolith architecture with Express REST API, React 19, TypeScript, Zod
            validation, Pino logging, and Vitest test suite.
          </p>
        </div>

        {/* API Status Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
                API Baseline Status (`/api/v1/health`)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to express backend running on port 3000
              </p>
            </div>
            {error ? (
              <span className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/50 px-3 py-1.5 rounded-md">
                ⚠️ {error}
              </span>
            ) : health ? (
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400">Environment: {health.environment}</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400">Version: {health.version}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">
                  Timestamp: {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <span className="text-xs font-mono text-slate-400 animate-pulse">
                Loading API status...
              </span>
            )}
          </div>
        </div>

        {/* Modular Architecture Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              System Modules
              <span className="text-xs font-mono text-slate-500 font-normal">
                (Target Capabilities)
              </span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">10 Core Modules Planned</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((mod, idx) => (
              <div
                key={idx}
                className="group relative bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                      {mod.category}
                    </span>
                    <span className="text-xs font-mono text-slate-600 group-hover:text-cyan-400/70 transition-colors">
                      Module {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{mod.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Architecture Ready</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-6 text-center text-xs text-slate-500 font-mono">
        KENENISA OS — Advanced Monorepo Architecture Foundation Baseline
      </footer>
    </div>
  );
};
