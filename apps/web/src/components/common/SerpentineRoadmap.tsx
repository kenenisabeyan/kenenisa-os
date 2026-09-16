import React from 'react';

export interface RoadmapStep {
  number: string;
  badgeTitle: string;
  title: string;
  subtitle: string;
  description: string;
  focusAreas: string[];
  themeColor: string; // Hex color e.g. '#6366F1'
  bgBadgeColor: string; // e.g. 'bg-indigo-50 border-indigo-200 text-[#6366F1]'
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
  title = 'Structured Personal Engineering Journey',
  subtitle = 'From initial requirement discovery to zero-friction production execution, our 7-step operating roadmap is built for reliability, evidence, and long-term career growth.',
  badgeText = 'OPERATING LIFECYCLE & METHODOLOGY',
  summaryBadgeText = 'SEVEN STEPS',
  summaryTitle = 'FROM INTENTION TO DIGITAL IMPACT',
  summaryDescription = 'A structured personal operating system process that transforms complex ambitions, coursework, and projects into reliable, scalable, and verifiable engineering proof.',
  summaryMetaText = 'KENENISA OS • METHODOLOGY BLUEPRINT',
  steps: customSteps,
}) => {
  const defaultSteps: RoadmapStep[] = [
    {
      number: '01',
      badgeTitle: 'DEFINE DIRECTION',
      title: 'DISCOVER & PLAN THE DIRECTION',
      subtitle: 'Understand Strategy Before You Engineer.',
      description:
        'We begin with in-depth requirement analysis, workstream scope definition, and strategic goal setting to map your personal academic, technical, and career trajectory.',
      focusAreas: [
        'Business & career trajectory analysis',
        'Workstream & scope definition',
        'Strategic goal & target mapping',
        'Structural architecture planning',
      ],
      themeColor: '#6366F1',
      bgBadgeColor: 'bg-indigo-50 border-indigo-200 text-[#6366F1]',
      badgeTextColor: 'text-[#6366F1]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '02',
      badgeTitle: 'STRUCTURE WORK',
      title: 'STRATEGIZE, DESIGN & ARCHITECT',
      subtitle: 'Turn Insight into a Clear Engineering Blueprint.',
      description:
        'Transform high-level goals into executable multi-stage Projects, sequential Milestones, and granular Tasks with strict priority levels and dependency graphs.',
      focusAreas: [
        'Solution strategy & workstream breakdown',
        'Project & milestone architecture',
        'Task priority matrix (P0 Critical, P1 High)',
        'Output deliverable & evidence specs',
      ],
      themeColor: '#3B82F6',
      bgBadgeColor: 'bg-blue-50 border-blue-200 text-[#3B82F6]',
      badgeTextColor: 'text-[#3B82F6]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      number: '03',
      badgeTitle: 'PLAN CAPACITY',
      title: 'PLAN CAPACITY & TIME BLOCKS',
      subtitle: 'Match Effort with Real Available Time.',
      description:
        'Calculate available daily/weekly hours budget and schedule task effort into dedicated focus time blocks to eliminate overcommitment and scheduling collisions.',
      focusAreas: [
        'Daily & weekly capacity budgeting',
        'Time-block allocation & focus slots',
        'Overcommitment & conflict detection',
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
      number: '04',
      badgeTitle: 'EXECUTE WORK',
      title: 'ENGINEER & BUILD THE SOLUTION',
      subtitle: 'Build Technology That Works in the Real World.',
      description:
        'Execute unblocked tasks using deterministic Next Best Action prioritization. Focus deep work sessions on high-impact priorities without context switching.',
      focusAreas: [
        'Deterministic Next Best Action selection',
        'Test-driven & sprint execution',
        'Clean modular code & API integration',
        'Dependency resolution & deep work focus',
      ],
      themeColor: '#FF5A00',
      bgBadgeColor: 'bg-orange-50 border-orange-200 text-[#FF5A00]',
      badgeTextColor: 'text-[#FF5A00]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      number: '05',
      badgeTitle: 'PRODUCE EVIDENCE',
      title: 'VALIDATE, SECURE & TEST',
      subtitle: 'Ensure Quality Before It Claims Impact.',
      description:
        'Task and project completions automatically generate observable proof items—such as pull request URLs, published docs, repository commits, and test pass rates.',
      focusAreas: [
        'Observable proof artifact logging',
        'Pull request & repository link verification',
        'Security validation & penetration testing',
        'Evidence Vault portfolio repository',
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
      number: '06',
      badgeTitle: 'REVIEW & REFLECT',
      title: 'REVIEW, REFLECT & REASON WITH AI',
      subtitle: 'Extract Meaningful Insights From Execution Data.',
      description:
        'Conduct weekly reviews with Intelligence Core advisory. Evaluate velocity, identify root causes for blockages, and capture lessons learned in structured reflections.',
      focusAreas: [
        'Weekly velocity & capacity audits',
        'Blockage & dependency root cause analysis',
        'Intelligence Core AI advisory insights',
        'Qualitative reflection & key learnings',
      ],
      themeColor: '#A855F7',
      bgBadgeColor: 'bg-purple-50 border-purple-200 text-[#A855F7]',
      badgeTextColor: 'text-[#A855F7]',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-disabled" />
        </svg>
      ),
    },
    {
      number: '07',
      badgeTitle: 'EVOLVE & SCALE',
      title: 'DEPLOY, EVOLVE & SCALE CAREER',
      subtitle: 'Technology & Career Should Keep Moving Forward.',
      description:
        'Translate verified evidence and skill progress into target career opportunity pipelines. Match verified capabilities against job descriptions and client proposals.',
      focusAreas: [
        'Continuous improvement & capacity scaling',
        'Skill-to-opportunity gap analysis',
        'Evidence portfolio matching for applications',
        'Long-term career trajectory evolution',
      ],
      themeColor: '#FFD700',
      bgBadgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
      badgeTextColor: 'text-amber-600',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  const steps = customSteps || defaultSteps;

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 font-sans">
      {/* ── SECTION TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 max-w-2xl">
            {subtitle}
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cyan-400/60 bg-cyan-50/50 text-[#3AB1EC] text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-2xs">
          <span>✧</span>
          <span>{badgeText}</span>
          <span>✧</span>
        </div>
      </div>

      {/* ── TOP SUMMARY CARD ───────────────────────────────────────────────────── */}
      <div className="mb-16 max-w-md">
        <div className="relative bg-white border border-cyan-300/80 rounded-2xl p-6 shadow-md shadow-cyan-500/5 space-y-3 group hover:border-[#3AB1EC] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3AB1EC]">
              {summaryBadgeText}
            </span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#3AB1EC] to-[#3B82F6] flex items-center justify-center font-bold text-white text-[10px]">
              K
            </div>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {summaryTitle}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {summaryDescription}
          </p>
          <div className="pt-1 text-[9px] font-mono text-[#3AB1EC] tracking-widest uppercase">
            {summaryMetaText}
          </div>
        </div>
      </div>

      {/* ── SERPENTINE TIMELINE ROADMAP GRAPHIC ────────────────────────────────── */}
      <div className="relative">
        {/* Central Serpentine SVG Ribbon Line (Visible on Desktop md:) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-48 pointer-events-none z-0">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 1400">
            <defs>
              <linearGradient id="serpentineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="16%" stopColor="#3B82F6" />
                <stop offset="33%" stopColor="#3AB1EC" />
                <stop offset="50%" stopColor="#FF5A00" />
                <stop offset="66%" stopColor="#22C55E" />
                <stop offset="83%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>

            {/* Background Wavy Ribbon Track */}
            <path
              d="M 50 0 C 95 100, 5 200, 50 300 C 95 400, 5 500, 50 600 C 95 700, 5 800, 50 900 C 95 1000, 5 1100, 50 1200 C 95 1300, 5 1400, 50 1400"
              fill="none"
              stroke="url(#serpentineGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              className="opacity-90"
            />
            {/* Inner Glowing Core Path */}
            <path
              d="M 50 0 C 95 100, 5 200, 50 300 C 95 400, 5 500, 50 600 C 95 700, 5 800, 50 900 C 95 1000, 5 1100, 50 1200 C 95 1300, 5 1400, 50 1400"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 4"
              className="opacity-80"
            />
          </svg>
        </div>

        {/* Vertical Straight Line (Visible on Mobile) */}
        <div className="md:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-[#6366F1] via-[#FF5A00] to-[#FFD700] rounded-full z-0" />

        {/* Steps List */}
        <div className="space-y-16 md:space-y-24 relative z-10">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0; // Even indexes -> Content Right on Desktop; Odd -> Content Left

            return (
              <div
                key={step.number}
                className="relative flex flex-col md:flex-row items-start md:items-center group"
              >
                {/* ── MOBILE STEP CIRCLE (Left aligned on Mobile) ── */}
                <div className="md:hidden flex items-center gap-4 mb-4 pl-1">
                  <div
                    className="w-12 h-12 rounded-full bg-white border-2 flex flex-col items-center justify-center shadow-md shrink-0"
                    style={{ borderColor: step.themeColor }}
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                      STEP
                    </span>
                    <span className="text-sm font-extrabold leading-none" style={{ color: step.themeColor }}>
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${step.bgBadgeColor}`}>
                      {step.badgeTitle}
                    </span>
                  </div>
                </div>

                {/* ── DESKTOP CONTENT LEFT BOX ── */}
                <div className="hidden md:block w-1/2 pr-12 text-right">
                  {!isEven && (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 relative group-hover:border-slate-300">
                      {/* Icon Circle (Top Left on Left Card) */}
                      <div className="flex justify-start">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                          style={{ backgroundColor: step.themeColor }}
                        >
                          {step.icon}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                          {step.title}
                        </h3>
                        <p className="text-xs font-semibold italic text-slate-500 mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 text-left space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          FOCUS AREAS:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700 font-normal">
                          {step.focusAreas.map((area, aIdx) => (
                            <li key={aIdx} className="flex items-center gap-2 justify-start">
                              <span
                                className="w-1.5 h-1.5 rounded-xs shrink-0"
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
                  <div
                    className="w-20 h-20 rounded-full bg-white border-4 flex flex-col items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-110"
                    style={{
                      borderColor: step.themeColor,
                      boxShadow: `0 10px 25px -5px ${step.themeColor}33`,
                    }}
                  >
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                      STEP
                    </span>
                    <span
                      className="text-2xl font-black leading-none tracking-tight"
                      style={{ color: step.themeColor }}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* ── DESKTOP CONTENT RIGHT BOX ── */}
                <div className="w-full md:w-1/2 md:pl-12 text-left">
                  {(isEven || true) && (
                    <div
                      className={`bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 relative group-hover:border-slate-300 ${
                        !isEven ? 'md:hidden' : ''
                      }`}
                    >
                      {/* Icon Circle (Top Right on Right Card) */}
                      <div className="flex justify-end">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
                          style={{ backgroundColor: step.themeColor }}
                        >
                          {step.icon}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                          {step.title}
                        </h3>
                        <p className="text-xs font-semibold italic text-slate-500 mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          FOCUS AREAS:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-700 font-normal">
                          {step.focusAreas.map((area, aIdx) => (
                            <li key={aIdx} className="flex items-center gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-xs shrink-0"
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
  );
};
