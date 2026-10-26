import React from 'react';

export interface RoadmapStep {
  number: string;
  badgeTitle: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  themeColor: string; // Hex color e.g. '#8B5CF6'
  bgBadgeColor: string;
  badgeTextColor: string;
  icon: React.ReactNode;
}

export interface SerpentineRoadmapProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  summaryBadgeText?: string;
  summaryTitle?: string;
  summaryDescription?: string;
  summaryMetaText?: string;
  steps?: RoadmapStep[];
}

export const SerpentineRoadmap: React.FC<SerpentineRoadmapProps> = ({
  title = 'Structured Engineering Journey',
  subtitle = 'From initial requirement discovery to zero-downtime production deployment, our 5-phase engineering roadmap built for reliability and scale.',
  badgeText = 'DEVELOPMENT LIFECYCLE & PROCESS',
  summaryBadgeText = 'FIVE STEPS',
  summaryTitle = 'FROM CHALLENGE TO DIGITAL IMPACT',
  summaryDescription = 'A structured engineering process that transforms complex business challenges into reliable, scalable, and future-ready technology solutions.',
  summaryMetaText = 'KENENISA OS • ENGINEERING ROADMAP',
  steps: customSteps,
}) => {
  const [activeStepIndex, setActiveStepIndex] = React.useState<number | null>(null);

  const defaultSteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'REQUIREMENT ANALYSIS',
      title: 'DISCOVER & PLAN THE CHALLENGE',
      subtitle: 'Understand Before We Engineer.',
      description:
        'We begin with in-depth requirement analysis, tech stack selection, scope definition, and structural architecture planning to understand your organization, users, workflows, and long-term objectives.',
      focusAreas: [
        'Business & workflow analysis',
        'Tech stack & scope definition',
        'User & stakeholder requirements',
        'Structural architecture planning',
      ],
      themeColor: '#7C3AED',
      bgBadgeColor: 'bg-purple-50 border-purple-200 text-[#7C3AED]',
      badgeTextColor: 'text-[#7C3AED]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'ARCHITECTURE & DESIGN',
      title: 'STRATEGIZE, DESIGN & ARCHITECT',
      subtitle: 'Turn Insight Into a Clear Technology Blueprint.',
      description:
        'Our engineers transform requirements into high-performance microservices architecture designs, REST/GraphQL API specifications, intuitive UI/UX wireframes, and actionable implementation roadmaps.',
      focusAreas: [
        'Solution strategy & UX planning',
        'Microservices & software architecture',
        'REST & GraphQL API specifications',
        'UI/UX wireframing & tech selection',
      ],
      themeColor: '#0284C7',
      bgBadgeColor: 'bg-cyan-50 border-cyan-200 text-[#0284C7]',
      badgeTextColor: 'text-[#0284C7]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      number: '03',
      badgeTitle: 'ENGINEERING & BUILD',
      title: 'ENGINEER & CONSTRUCT SOLUTION',
      subtitle: 'Build Robust Technology with Clean Code.',
      description:
        'Execute development sprints using test-driven methodology, modular component architecture, robust typing, and continuous automated quality gates.',
      focusAreas: [
        'Modular full-stack implementation',
        'Automated testing & type safety',
        'State management & micro-interactions',
        'Database migration & ORM integration',
      ],
      themeColor: '#2563EB',
      bgBadgeColor: 'bg-blue-50 border-blue-200 text-[#2563EB]',
      badgeTextColor: 'text-[#2563EB]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      number: '04',
      badgeTitle: 'VERIFICATION & QA',
      title: 'VALIDATE, TEST & PRODUCE PROOF',
      subtitle: 'Ensure Production Reliability Before Deployment.',
      description:
        'Rigorous end-to-end QA testing, performance profiling, security audits, and observable evidence generation before pushing to staging and production.',
      focusAreas: [
        'End-to-end E2E testing suite',
        'Security & vulnerability scanning',
        'Performance & load optimization',
        'Verifiable proof & evidence vaulting',
      ],
      themeColor: '#EA580C',
      bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#EA580C]',
      badgeTextColor: 'text-[#EA580C]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: '05',
      badgeTitle: 'DEPLOYMENT & SCALING',
      title: 'DEPLOY, MONITOR & EVOLVE',
      subtitle: 'Zero-Downtime Delivery & Continuous Evolution.',
      description:
        'Automated zero-downtime deployment pipelines, real-time observability telemetry, health monitoring, and data-driven continuous optimization.',
      focusAreas: [
        'Zero-downtime CI/CD deployment',
        'Observability & Pino telemetry logging',
        'Incident response & recovery runbooks',
        'Continuous feature evolution',
      ],
      themeColor: '#16A34A',
      bgBadgeColor: 'bg-green-50 border-green-200 text-[#16A34A]',
      badgeTextColor: 'text-[#16A34A]',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  const steps = customSteps || defaultSteps;
  const [autoTourActive, setAutoTourActive] = React.useState(false);

  React.useEffect(() => {
    if (!autoTourActive) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev === null ? 0 : (prev + 1) % steps.length));
    }, 2800);
    return () => clearInterval(interval);
  }, [autoTourActive, steps.length]);

  // Generate 100% smooth C2-continuous serpentine ribbon path
  const stepHeight = 440;
  const topPadding = 180;
  const totalSvgHeight = steps.length * stepHeight + topPadding;

  let pathD = `M 50 0 L 50 ${topPadding} `;
  for (let i = 0; i < steps.length - 1; i++) {
    const yStart = topPadding + i * stepHeight;
    const yEnd = topPadding + (i + 1) * stepHeight;
    const yMid = (yStart + yEnd) / 2;

    // Tight localized sway curving right around step numbers (xSway = 55 right, 45 left)
    const xSway = i % 2 === 0 ? 55 : 45;

    pathD += `C 50 ${yStart + 60}, ${xSway} ${yMid - 50}, ${xSway} ${yMid} `;
    pathD += `C ${xSway} ${yMid + 50}, 50 ${yEnd - 60}, 50 ${yEnd} `;
  }
  pathD += `L 50 ${totalSvgHeight} `;

  return (
    <div className="w-full relative overflow-hidden py-16 sm:py-20 px-4 sm:px-8 lg:px-12 font-sans bg-slate-50/40">
      {/* ── WATER FLOW & AMBIENT PULSE ANIMATION KEYFRAMES ───────────────────── */}
      <style>{`
        @keyframes waterFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -40;
          }
        }
        @keyframes waterPulse {
          0%, 100% {
            opacity: 0.65;
            transform: scale(1.35);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.50);
          }
        }
        .animate-water-flow {
          animation: waterFlow 0.75s linear infinite;
        }
        .animate-water-pulse {
          animation: waterPulse 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* ── TOP FULL-WIDTH GRADIENT BAR ─────────────────────────────────────────── */}
      <div className="w-full h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-600 rounded-full mb-12 opacity-80" />

      {/* ── BACKGROUND DOTTED GRID PATTERN (MATCHING DESIGN SCREENSHOT) ──────────── */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284C728_1.2px,transparent_1.2px)] [background-size:20px_20px] pointer-events-none z-0" />

      <div className="max-w-[1720px] mx-auto relative z-10">
        {/* ── SECTION TOP HEADER ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-500 font-medium mt-3 max-w-5xl">
              {subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-cyan-50/90 border border-cyan-200/90 text-[#0284C7] text-xs font-extrabold uppercase tracking-widest shadow-xs shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] animate-pulse" />
            <span>{badgeText}</span>
            <span className="text-cyan-500">⚡</span>
          </div>
        </div>

        {/* ── SUMMARY CARD (PLACED DIRECTLY BELOW HEADER WITH MARGIN) ─────────────── */}
        <div className="mb-16 md:mb-20 max-w-2xl">
          <div className="relative rounded-2xl bg-white p-7 sm:p-9 border border-cyan-100/90 shadow-xl shadow-cyan-900/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-cyan-200 group/summary">
            {/* Left Vertical Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#0284C7] rounded-l-2xl" />

            {/* Translucent Geometric Watermark */}
            <div className="absolute right-5 bottom-5 pointer-events-none opacity-20 select-none font-black text-[10px] text-[#0284C7] tracking-widest uppercase flex flex-col items-end leading-tight">
              <svg className="w-16 h-16 mb-1 text-cyan-600 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>KENENISA OS</span>
              <span>GLOBAL</span>
            </div>

            <div className="pl-3 relative z-10 space-y-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#0284C7] block">
                {summaryBadgeText}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight uppercase">
                {summaryTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                {summaryDescription}
              </p>
              <div className="pt-2 text-[10px] font-mono font-bold text-[#0284C7] tracking-widest uppercase">
                {summaryMetaText}
              </div>
            </div>
          </div>
        </div>

        {/* ── SERPENTINE TIMELINE ROADMAP GRAPHIC ────────────────────────────────── */}
        <div className="relative">
          {/* Central Serpentine SVG Ribbon Line (Visible on Desktop md:) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-56 lg:w-64 xl:w-72 pointer-events-none z-0">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox={`0 0 100 ${totalSvgHeight}`}
            >
              <defs>
                <linearGradient id="serpentineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="25%" stopColor="#0284C7" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="75%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>

                <filter id="ribbonShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Outer 3D Gradient Ribbon Track */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#serpentineGradient)"
                strokeWidth="32"
                strokeLinecap="round"
                filter="url(#ribbonShadow)"
                className="opacity-95"
              />

              {/* Inner White Animated Water Flow Capsule Slots */}
              <path
                d={`M 50 0 L 50 ${totalSvgHeight}`}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeDasharray="18 22"
                className="animate-water-flow opacity-95"
              />
            </svg>
          </div>

          {/* ── Interactive Mobile Stage Switcher & Flow Bar (Visible on Mobile) ── */}
          <div className="md:hidden flex items-center justify-between bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-sm mb-6 relative z-20">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {steps.map((s, sIdx) => {
                const isCur = activeStepIndex === sIdx;
                return (
                  <button
                    key={s.number}
                    onClick={() => {
                      setActiveStepIndex(isCur ? null : sIdx);
                      const el = document.getElementById(`mobile-step-card-${sIdx}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCur
                        ? 'text-white shadow-md scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    style={isCur ? { backgroundColor: s.themeColor, boxShadow: `0 4px 12px ${s.themeColor}55` } : {}}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isCur ? 'bg-white animate-ping' : ''}`}
                      style={!isCur ? { backgroundColor: s.themeColor } : {}}
                    />
                    {s.number}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setAutoTourActive((v) => !v)}
              className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border cursor-pointer ${
                autoTourActive
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Toggle automatic walkthrough mode"
            >
              <span>{autoTourActive ? '⏸ Stop' : '⚡ Auto-Flow'}</span>
            </button>
          </div>

          {/* ── Vertical Animated Energy Spine (Visible on Mobile) ── */}
          <div className="md:hidden absolute left-[22px] top-16 bottom-6 w-2 rounded-full z-0 overflow-visible pointer-events-none">
            {/* Ambient Background Track */}
            <div className="absolute inset-0 w-full rounded-full bg-slate-200/90 shadow-[0_0_8px_rgba(124,58,237,0.15)]" />

            {/* Glowing Moving Gradient Dynamic Spectrum */}
            <div className="absolute inset-0 w-full rounded-full bg-gradient-to-b from-[#7C3AED] via-[#0284C7] via-[#2563EB] via-[#EA580C] to-[#16A34A] animate-spine-flow shadow-[0_0_12px_rgba(37,99,235,0.35)]" />

            {/* Primary High-Speed Flowing Laser Pulse */}
            <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-24 rounded-full bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_16px_#38bdf8] animate-laser-travel" />

            {/* Secondary Interleaved Flowing Laser Pulse */}
            <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-28 rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent shadow-[0_0_18px_#818cf8] animate-laser-travel-delayed" />

            {/* Micro-spark particles floating along the spine */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#fff] animate-particle-float-1" />
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#38bdf8] animate-particle-float-2" />
            <div className="absolute left-1/2 -translate-x-1/2 top-3/4 w-1.5 h-1.5 rounded-full bg-purple-200 shadow-[0_0_6px_#a855f7] animate-particle-float-3" />
          </div>

          {/* Steps List */}
          <div className="space-y-12 md:space-y-24 relative z-10">
            {steps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const isActive = activeStepIndex === idx;

              return (
                <div
                  key={step.number}
                  className="relative flex flex-col md:flex-row items-start md:items-center min-h-0 md:min-h-[380px]"
                >
                  {/* ── MOBILE CARD LAYOUT (Renders for ALL steps on mobile) ── */}
                  <div className="md:hidden flex flex-col relative z-10 w-full space-y-4">
                    {/* Step Icon & Badge with Radar Pulse & Satellite Orbit */}
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {/* Outer Concentric Radar Pulse Beacon */}
                        <div
                          className="absolute -inset-2 rounded-full animate-pulse-beacon opacity-75 pointer-events-none"
                          style={{ backgroundColor: step.themeColor }}
                        />
                        <div
                          className="absolute -inset-4 rounded-full animate-pulse-beacon opacity-40 pointer-events-none"
                          style={{ backgroundColor: step.themeColor, animationDelay: '1.2s' }}
                        />

                        {/* Orbiting Satellite Electron Particle */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="animate-satellite-orbit w-full h-full flex items-center justify-center">
                            <div
                              className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                              style={{ backgroundColor: step.themeColor, color: step.themeColor }}
                            />
                          </div>
                        </div>

                        {/* Ambient Glow */}
                        <div
                          className="absolute inset-0 rounded-full opacity-40 blur-xs pointer-events-none"
                          style={{ backgroundColor: step.themeColor }}
                        />

                        {/* Step Circle Badge */}
                        <button
                          onClick={() => setActiveStepIndex(isActive ? null : idx)}
                          className={`relative w-12 h-12 rounded-full bg-white border-4 flex flex-col items-center justify-center shadow-md animate-step-breathe transition-all duration-300 cursor-pointer ${
                            isActive ? 'scale-110 ring-4 ring-offset-2' : ''
                          }`}
                          style={{
                            borderColor: step.themeColor,
                            boxShadow: `0 4px 18px ${step.themeColor}40`,
                          }}
                        >
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">
                            STEP
                          </span>
                          <span className="text-sm font-black leading-none" style={{ color: step.themeColor }}>
                            {step.number}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-2xs ${step.bgBadgeColor}`}>
                          {step.badgeTitle}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                            Live Focus
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step Card Container with Left-Side Animated Runner */}
                    <div
                      id={`mobile-step-card-${idx}`}
                      onClick={() => setActiveStepIndex(isActive ? null : idx)}
                      className={`relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border transition-all duration-300 space-y-4 ml-6 sm:ml-8 cursor-pointer group ${
                        isActive
                          ? 'border-transparent ring-2 scale-[1.01] shadow-2xl'
                          : 'border-slate-200/90 shadow-md hover:border-slate-300'
                      }`}
                      style={
                        isActive
                          ? {
                              boxShadow: `0 14px 34px -6px ${step.themeColor}30, 0 0 20px 2px ${step.themeColor}20`,
                              outlineColor: step.themeColor,
                            }
                          : {}
                      }
                    >
                      {/* Watermark Step Number in Background */}
                      <span className="absolute -bottom-4 -right-2 text-6xl font-black text-slate-100/70 select-none pointer-events-none tracking-tighter">
                        {step.number}
                      </span>

                      {/* Animated Circuit Connector Branch from Spine into Card */}
                      <div
                        className="absolute -left-6 top-7 w-6 h-[2px] pointer-events-none overflow-hidden"
                        style={{
                          background: `linear-gradient(90deg, ${step.themeColor} 0%, ${step.themeColor}99 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 w-2 h-full bg-white shadow-[0_0_8px_#fff] rounded-full animate-photon-bridge" />
                      </div>

                      {/* Left-Side Glowing Animated Energy Runner Bar (Dual-Layer Plasma Channel) */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl overflow-hidden bg-slate-100/90 pointer-events-none">
                        {/* Ambient Base Pulsing Glow */}
                        <div
                          className="absolute inset-0 opacity-30 animate-neon-border-pulse"
                          style={{ backgroundColor: step.themeColor }}
                        />

                        {/* Primary Laser Plasma Runner */}
                        <div
                          className="absolute w-full h-28 rounded-full animate-plasma-travel"
                          style={{
                            background: `linear-gradient(180deg, transparent 0%, #ffffff 30%, ${step.themeColor} 70%, transparent 100%)`,
                            boxShadow: `0 0 12px ${step.themeColor}, 0 0 24px ${step.themeColor}99`,
                          }}
                        />

                        {/* Secondary Faster Plasma Runner */}
                        <div
                          className="absolute w-full h-20 rounded-full animate-plasma-travel-fast"
                          style={{
                            background: `linear-gradient(180deg, transparent 0%, #ffffff 40%, ${step.themeColor} 80%, transparent 100%)`,
                            boxShadow: `0 0 10px ${step.themeColor}`,
                          }}
                        />
                      </div>

                      {/* Left Connector Cybernetic Nodes (Top, Mid, Bottom) */}
                      <div
                        className="absolute -left-1 top-6 w-3 h-3 rounded-full border-2 border-white shadow-md z-10 pointer-events-none animate-electric-flicker"
                        style={{
                          backgroundColor: step.themeColor,
                          boxShadow: `0 0 10px ${step.themeColor}`,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: step.themeColor }}
                        />
                      </div>

                      <div
                        className="absolute -left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-white shadow-xs z-10 pointer-events-none animate-electric-flicker"
                        style={{
                          backgroundColor: step.themeColor,
                          boxShadow: `0 0 6px ${step.themeColor}`,
                        }}
                      />

                      <div
                        className="absolute -left-0.5 bottom-6 w-1.5 h-1.5 rounded-full border border-white shadow-xs z-10 pointer-events-none animate-electric-flicker"
                        style={{
                          backgroundColor: step.themeColor,
                          boxShadow: `0 0 6px ${step.themeColor}`,
                        }}
                      />

                      {/* Header Content */}
                      <div className="flex items-start justify-between gap-3 pl-2 relative z-10">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-snug">
                            {step.title}
                          </h3>
                          <p className="text-xs font-bold italic text-slate-500 mt-1">
                            {step.subtitle}
                          </p>
                        </div>
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform duration-300"
                          style={{
                            backgroundColor: step.themeColor,
                            boxShadow: `0 4px 14px ${step.themeColor}45`,
                          }}
                        >
                          {step.icon}
                        </div>
                      </div>

                      {/* Gradient Divider with Shimmer Sweep */}
                      <div
                        className="relative overflow-hidden h-1 rounded-full w-full max-w-[200px] ml-2"
                        style={{
                          background: `linear-gradient(90deg, ${step.themeColor} 0%, ${step.themeColor}44 70%, transparent 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-sweep" />
                      </div>

                      <p className="text-sm text-slate-700 leading-relaxed font-normal pl-2 relative z-10">
                        {step.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 space-y-2 pl-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                            FOCUS AREAS:
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {isActive ? '● Active View' : 'Tap to focus'}
                          </span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                          {step.focusAreas.map((area, aIdx) => (
                            <li key={aIdx} className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 transition-transform ${
                                  isActive ? 'scale-125' : ''
                                }`}
                                style={{
                                  backgroundColor: step.themeColor,
                                  boxShadow: isActive ? `0 0 6px ${step.themeColor}` : 'none',
                                }}
                              />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ── DESKTOP CONTENT LEFT COLUMN ── */}
                  <div className="hidden md:block w-1/2 md:pr-12 lg:pr-24 xl:pr-32 text-left">
                    {/* Left Column Content for Step 02, Step 04, etc. */}
                    {!isEven && (
                      <div
                        onClick={() => setActiveStepIndex(isActive ? null : idx)}
                        className={`p-2 transition-all duration-300 space-y-6 relative group/card cursor-pointer bg-transparent max-w-xl ml-auto ${
                          isActive ? 'scale-[1.02] bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xl' : 'hover:-translate-y-1'
                        }`}
                      >
                        {/* Header: Icon on LEFT + Title Block on RIGHT */}
                        <div className="flex items-start gap-5">
                          <div
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover/card:scale-110"
                            style={{
                              backgroundColor: step.themeColor,
                              boxShadow: `0 10px 25px -4px ${step.themeColor}55`,
                            }}
                          >
                            {step.icon}
                          </div>

                          <div className="flex-1 pt-0.5">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase leading-snug">
                              {step.title}
                            </h3>
                            <p className="text-sm sm:text-base lg:text-lg font-bold italic text-slate-500 mt-1">
                              {step.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Horizontal Gradient Divider Bar */}
                        <div
                          className="h-[3.5px] rounded-full my-3 w-full max-w-[380px]"
                          style={{
                            background: `linear-gradient(90deg, ${step.themeColor} 0%, ${step.themeColor}44 70%, transparent 100%)`,
                          }}
                        />

                        <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed font-normal">
                          {step.description}
                        </p>

                        <div className="pt-4 border-t border-slate-200/60 space-y-3">
                          <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900 block">
                            FOCUS AREAS:
                          </span>
                          <ul className="space-y-2.5 text-base sm:text-lg text-slate-800 font-medium">
                            {step.focusAreas.map((area, aIdx) => (
                              <li key={aIdx} className="flex items-center gap-3">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: step.themeColor }}
                                />
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── DESKTOP CENTRAL STEP CIRCLE NODE ── */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center z-20">
                    <div className="relative flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full blur-3xl opacity-70 transition-all duration-300 group-hover:opacity-100 scale-140 pointer-events-none animate-water-pulse"
                        style={{ backgroundColor: step.themeColor }}
                      />

                      <button
                        onClick={() => setActiveStepIndex(isActive ? null : idx)}
                        className={`w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full bg-white border border-white/80 flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 cursor-pointer relative z-10 shadow-2xl ${
                          isActive ? 'scale-110 ring-4 ring-offset-2' : ''
                        }`}
                        style={{
                          boxShadow: `0 20px 50px -10px ${step.themeColor}55, 0 8px 24px -4px ${step.themeColor}33`,
                        }}
                      >
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-0.5">
                          STEP
                        </span>
                        <span
                          className="text-5xl sm:text-6xl font-black leading-none tracking-tight"
                          style={{ color: step.themeColor }}
                        >
                          {step.number}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ── DESKTOP CONTENT RIGHT COLUMN ── */}
                  <div className="hidden md:block w-1/2 md:pl-12 lg:pl-24 xl:pl-32 text-left">
                    {/* Right Column Content for Step 01, Step 03, Step 05, etc. */}
                    {isEven && (
                      <div
                        onClick={() => setActiveStepIndex(isActive ? null : idx)}
                        className={`p-2 transition-all duration-300 space-y-6 relative group/card cursor-pointer bg-transparent max-w-xl ${
                          isActive ? 'scale-[1.02] bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-slate-200 shadow-xl' : 'hover:-translate-y-1'
                        }`}
                      >
                        {/* Header: Title Block on LEFT + Icon on RIGHT */}
                        <div className="flex items-start justify-between gap-5">
                          <div className="flex-1 pt-0.5">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase leading-snug">
                              {step.title}
                            </h3>
                            <p className="text-sm sm:text-base lg:text-lg font-bold italic text-slate-500 mt-1">
                              {step.subtitle}
                            </p>
                          </div>

                          <div
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover/card:scale-110"
                            style={{
                              backgroundColor: step.themeColor,
                              boxShadow: `0 10px 25px -4px ${step.themeColor}55`,
                            }}
                          >
                            {step.icon}
                          </div>
                        </div>

                        {/* Horizontal Gradient Divider Bar */}
                        <div
                          className="h-[3.5px] rounded-full my-3 w-full max-w-[380px]"
                          style={{
                            background: `linear-gradient(90deg, ${step.themeColor} 0%, ${step.themeColor}44 70%, transparent 100%)`,
                          }}
                        />

                        <p className="text-base sm:text-lg lg:text-xl text-slate-700 leading-relaxed font-normal">
                          {step.description}
                        </p>

                        <div className="pt-4 border-t border-slate-200/60 space-y-3">
                          <span className="text-sm font-extrabold uppercase tracking-wider text-slate-900 block">
                            FOCUS AREAS:
                          </span>
                          <ul className="space-y-2.5 text-base sm:text-lg text-slate-800 font-medium">
                            {step.focusAreas.map((area, aIdx) => (
                              <li key={aIdx} className="flex items-center gap-3">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: step.themeColor }}
                                />
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
