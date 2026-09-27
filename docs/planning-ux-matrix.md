# KENENISA OS — Planning UX & Responsive Matrix

ID: `UX-001`  
Status: `APPROVED`

## Overview

The Multi-Horizon Planning interface provides seamless navigation across Yearly, Monthly, Weekly, and Daily horizons while adhering strictly to the KENENISA OS design system.

---

## 1. Design System & Palette Compliance (`UX-002`)

### Global Typography
- Font Family: `Roboto`, sans-serif.

### Semantic Palette Mapping
- `#3AB1EC` (Primary Action & Brand Blue)
- `#FF5A00` (Accent & High Priority)
- `#3B82F6` (In Progress / Info Blue)
- `#A855F7` (Yearly & Strategic Purple)
- `#6366F1` (Monthly & Workstream Indigo)
- `#FFD700` (Warning / Blocked Gold)
- `#22C55E` (Completed / Verified Green)
- `#F8FAFC` (Card & Background Light Gray)

### Outcome Badges Styling
- 🟢 `COMPLETED`: `#22C55E`
- 🟡 `PARTIALLY_COMPLETED`: `#EAB308`
- 🔴 `MISSED`: `#EF4444`
- 🟠 `BLOCKED`: `#F97316`
- 🔵 `IN_PROGRESS`: `#3B82F6`
- ⚪ `UNKNOWN`: `#64748B`
- ↪ `RESCHEDULED`: `#A855F7`
- ⚫ `CANCELLED`: `#475569`

---

## 2. Horizon Views Specifications (`UX-003`)

### 1. Year View
- Shows strategic outcomes, connected Workstreams, Goals, Projects, and yearly timeline.
- High-level progress breakdown without granular daily noise.

### 2. Month View
- Displays monthly focus outcomes, weekly workload distribution, and milestone deadlines.
- Clear status indicators for active vs completed monthly targets.

### 3. Week View
- Shows weekly objectives, capacity allocation (planned vs available hours), daily distribution cards, and carry-forward queue.
- Touch-friendly day selection tabs on smaller viewports.

### 4. Day View
- **Today's Primary Objective Banner**: Highlights single must-win focus for the day.
- **Timeline & Time Blocks**: Chronological execution blocks paired with actual task statuses.
- **Outcome Evaluation Cards**: Displays Expected vs Actual results with direct action to attach evidence or confirm outcome.
- **Factual Summary Panel**: Shows daily statistics (planned, completed, missed, actual time) generated deterministically.

---

## 3. Responsive Device Matrix

The planning UI is validated across standard breakpoints:

| Category | Resolution | Layout Strategy |
| :--- | :--- | :--- |
| Mobile Small | `320×568`, `360×640` | Single column stacked views, compact badges, horizontal tab scrolling. |
| Mobile Standard | `375×667`, `390×844`, `393×852`, `412×915`, `430×932` | Full touch target support ($>44\text{px}$), sticky action bar, single-day focused view. |
| Tablet | `768×1024`, `820×1180`, `1024×1366` | Two-column split (Timeline on left, Outcomes & Summary on right). |
| Desktop | `1280×720`, `1366×768`, `1440×900`, `1920×1080` | Full multi-horizon view, side-by-side horizon navigation & Command Center integration. |
