# KENENISA OS — Advanced Professional Product Pages

## 1. Executive Summary

KENENISA OS incorporates four advanced, factual, high-value professional operating pages designed to serve the core personal engineering & career workflows:

1. **PP-001: Executive Overview (`/app/executive`)**
2. **PP-002: Work Intelligence (`/app/work-intelligence`)**
3. **PP-003: Weekly Review (`/app/reviews`)**
4. **PP-004: Career & Opportunity Hub (`/app/career`)**

Each page integrates existing domain APIs, Prisma models, and system aggregates without introducing duplicate state or vanity metrics.

---

## 2. Page Specifications

### PP-001: Executive Overview
- **Route**: `/app/executive`
- **Primary Purpose**: "Where am I overall?" Strategic orientation across academic, engineering, product, career, and personal direction.
- **Key Sections**:
  - Strategic Direction Workstream Grid (configurable active workstreams with goal & project metrics).
  - Strategic Execution Flow Pipeline (`Workstreams → Goals → Projects → Milestones → Tasks Ready → Tasks Done → Evidence → Reviews`).
  - Executive System Health Indicators (Active Projects, Blocked Items, Paused Projects, Completed Reviews).
  - Critical Strategic Priorities (Factual P0 & P1 task list).
  - Recent Verified Evidence Timeline.
  - Executive Quick Navigation Matrix.

### PP-002: Work Intelligence
- **Route**: `/app/work-intelligence`
- **Primary Purpose**: "What is happening across my work?" Deep analysis of structure, bottlenecks, dependencies, workload concentration, and execution relationships.
- **Key Sections**:
  - Workload Concentration Grid (Ready, In Progress, Blocked, Completed ratios).
  - Active Bottlenecks & Execution Constraints Panel (Blocked tasks, overdue items, capacity conflicts).
  - Task Dependency Chain Viewer (`Task A → Task B → Task C`).
  - Unscheduled Ready Work Navigator.
  - Active Work Hierarchy Map (Expandable tree view of `Workstream → Goal → Project → Milestone → Task`).

### PP-003: Weekly Review
- **Route**: `/app/reviews`
- **Primary Purpose**: "What happened, what did I learn, what remains, and what should change next?". Engineering retrospective & strategic review loop.
- **Key Sections**:
  - Factual Summary Banner (Completed tasks, blocked items, planned hours, learning hours, evidence items, active projects).
  - Core Metric Logic Statement (`Task Estimate ≠ Scheduled Time ≠ Actual Time`).
  - Historical Weekly Review Sidebar.
  - Interactive Reflection Form (`Wins / What moved forward`, `Challenges / What was blocked`, `Lessons Learned`, `Next Week Focus`).
  - Strategic Review Decisions (`CONTINUE`, `ADJUST`, `DEFER`, `STOP`, `INVESTIGATE`).

### PP-004: Career & Opportunity Hub
- **Route**: `/app/career` (linked to `/app/opportunities`)
- **Primary Purpose**: "How does my existing work connect to future opportunities?". Connects verified skills, projects, concrete evidence, learning, and opportunity pipeline.
- **Key Sections**:
  - Career Opportunity Lifecycle Pipeline (`DISCOVERED → EVALUATING → PREPARING → APPLIED → INTERVIEW → OFFER`).
  - Skill → Project → Evidence → Opportunity Alignment Matrix.
  - Active Target Roles List & Detail View.
  - AI Advisory Career Assistant (Integration with Intelligence Core for opportunity relevance analysis labeled `[AI Advisory]`).

---

## 3. Design System & Typography Alignment
- **Typography**: 100% Google **Roboto** font family across all titles, body text, form controls, badges, and modals.
- **Color Palette**: Pristine `#F8FAFC` workspace background, `#FFFFFF` elevated cards, `#3B82F6` primary actions, `#3AB1EC` cyan context, `#6366F1` indigo active rings, `#A855F7` purple AI advisory, `#FF5A00` orange attention pills, `#22C55E` green success indicators.
- **Responsive Standard**: Tested and optimized for mobile (`320px` to `430px`), tablet (`768px` to `1024px`), and desktop (`1280px` to `1920px`).
