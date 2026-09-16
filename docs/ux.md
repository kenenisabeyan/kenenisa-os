# KENENISA OS — Product UX & Experience Guide

This document establishes the user experience architecture, layout shell structure, design system tokens, state card patterns, responsive behaviors, accessibility standards, and copy style for **KENENISA OS**.

---

## 1. Product Model & Navigation Hierarchy

KENENISA OS communicates a cohesive personal operating system experience through six primary functional sections:

```text
KENENISA OS
│
├── COMMAND CENTER
│   ├── Command Center  (/app/dashboard)
│   ├── Tasks           (/app/tasks)
│   └── Planning        (/app/planning)
│
├── BUILD
│   ├── Workstreams     (/app/workstreams)
│   ├── Goals           (/app/goals)
│   ├── Projects        (/app/projects)
│   └── Milestones      (/app/milestones)
│
├── DEVELOP
│   ├── Learning        (/app/learning)
│   └── Skills          (/app/skills)
│
├── PROOF
│   ├── Evidence        (/app/evidence)
│   └── Reviews         (/app/reviews)
│
├── GROW
│   ├── Analytics       (/app/analytics)
│   └── Opportunities   (/app/opportunities)
│
└── INTELLIGENCE
    └── AI Mentor       (/app/intelligence)
```

---

## 2. Layout Shell Components

- **`AppLayout` (`apps/web/src/components/layout/AppLayout.tsx`)**: Unified application container organizing the desktop sidebar, mobile drawer overlay, top mobile header, and main page content wrapper.
- **`Sidebar` (`apps/web/src/components/layout/Sidebar.tsx`)**: Fixed desktop navigation sidebar featuring grouped section titles, active route indicators, brand badge, and account control footer.
- **`MobileNav` & `MobileBottomBar` (`apps/web/src/components/layout/MobileNav.tsx`)**: Slide-out drawer menu and bottom touch bar for mobile screens (viewports $<1024$px).
- **`PageHeader` (`apps/web/src/components/layout/PageHeader.tsx`)**: Standardized header bar with title, description subtitle, dynamic breadcrumb trail, and top action buttons.
- **`ErrorBoundary` (`apps/web/src/components/common/ErrorBoundary.tsx`)**: React Error Boundary container preventing application crashes on unhandled render exceptions.

---

## 3. Design Tokens & Visual Hierarchy

- **Color Palette**: Dark mode base (`bg-slate-950`, `bg-slate-900/90`, `border-slate-800`), accent cyan/blue (`from-cyan-500 to-blue-600`), and semantic states (`emerald` for ready/done, `cyan` for in-progress/medium, `amber` for review/high, `rose` for blocked/urgent).
- **Badges (`apps/web/src/components/ui/Badge.tsx`)**: Standardized badge pills for domain statuses (`READY`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`, `CANCELLED`) and priorities (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
- **Typography**: Inter/Sans font stack with clear scale:
  - Page Title: `text-2xl font-bold tracking-tight text-white`
  - Subtitle: `text-xs text-slate-400`
  - Section Header: `text-sm font-bold text-white font-mono`
  - Body: `text-xs text-slate-300 leading-relaxed`

---

## 4. Loading, Empty, and Error States (`apps/web/src/components/ui/StateCard.tsx`)

- **`LoadingSkeleton`**: Animated skeleton pulse blocks (`animate-pulse bg-slate-900/60 border border-slate-800/60`) matching target grid heights.
- **`EmptyStateCard`**: Explains missing data, context, and actionable next steps without populating artificial mock records.
- **`ErrorStateCard`**: Sanitized error message container with explicit "Try Again" retry callback.

---

## 5. Accessibility & Mobile Standards

- **Keyboard Navigation**: Interactive elements support focus ring styling (`focus:outline-none focus:border-cyan-500`), `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- **Contrast Ratios**: Minimum 4.5:1 text-to-background contrast enforced for body text and status indicators.
- **Mobile Responsive Breakpoints**: Clean layout adaptation at 375px (mobile), 768px (tablet), and 1440px (desktop).
