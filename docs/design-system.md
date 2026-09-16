# KENENISA OS — Production Design System & Typography Architecture

## 1. Overview

KENENISA OS utilizes a unified, professional, evidence-backed design system built around a clean light workspace foundation (`#F8FAFC`), elevated surface cards (`#FFFFFF`), crisp borders (`#E2E8F0`), and the **exclusive Google Roboto typography system**.

---

## 2. Typography Architecture

### Official Application Font
- **Primary Font Family**: `Roboto` (`font-family: 'Roboto', sans-serif;`)
- **Global Font Token**: `--font-family-base: 'Roboto', sans-serif;`
- **Google Fonts Source**: `https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap`
- **Fallback**: `sans-serif`

### Global Font Enforcement Rules
1. **Root Application Scope**: Configured at `html, body, #root` via `var(--font-family-base)` in `src/index.css`.
2. **Form Control Inheritance**: All interactive elements (`button`, `input`, `textarea`, `select`, `option`, `optgroup`, `dialog`) explicitly inherit `font-family: inherit;`.
3. **Tailwind Global Integration**: `fontFamily.sans` maps exclusively to `['Roboto', 'sans-serif']`.

### Typography Hierarchy & Scale
| Level | Font Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| **Display / Page Title** | `Roboto 700 (Bold)` | `leading-tight` | Main page titles, modal titles (`text-xl`, `text-2xl`) |
| **Section Heading** | `Roboto 600 (SemiBold)` | `leading-snug` | Module titles, tab headings (`text-base`, `text-lg`) |
| **Card Heading** | `Roboto 600 / 500` | `leading-snug` | Task names, project cards, metric labels (`text-sm`) |
| **Body Text** | `Roboto 400 (Regular)` | `leading-relaxed` | Descriptions, details, paragraphs (`text-xs`, `text-sm`) |
| **Secondary & Metadata**| `Roboto 400 / 500` | `leading-normal` | Timestamps, counters, subtitles (`text-[11px]`, `text-xs`) |
| **Captions & Badges** | `Roboto 500 / 700` | `leading-none` | Status badges, domain tags, priority pills (`text-[10px]`) |

---

## 3. Brand Color Palette

| Color Token | Hex | Application |
| :--- | :--- | :--- |
| **Cyan** | `#3AB1EC` | System intelligence, technical metadata, domain indicators |
| **Primary Blue** | `#3B82F6` | Primary buttons, links, active navigation items |
| **Indigo** | `#6366F1` | Active focus rings (`focus:ring-indigo-500/20`), active tabs |
| **Purple** | `#A855F7` | AI Advisory headers, mentor cards, milestone badges |
| **Orange** | `#FF5A00` | Critical priority (P0), attention pills, active work |
| **Gold** | `#FFD700` | Highlights, star achievements, milestone checkpoints |
| **Green** | `#22C55E` | Success badges, completed status, healthy metrics |
| **Workspace BG** | `#F8FAFC` | Application canvas foundation |
| **Card Surface** | `#FFFFFF` | Elevated content containers with `border-slate-200/90` and `shadow-xs` |

---

## 4. Component Typography Rules

- **Shell Components** (`Header`, `Sidebar`, `MobileNav`, `Breadcrumbs`): Pure Roboto navigation labels with `font-medium` / `font-semibold`.
- **Form Controls** (`Input`, `Select`, `Textarea`, `DatePicker`): `font-normal` body text in inputs, `font-medium` / `font-bold` for field labels.
- **Feedback & States** (`Toast`, `LoadingSkeleton`, `EmptyStateCard`, `ErrorStateCard`): Clean Roboto messaging with precise error/info contrast.
- **Charts & Intelligence** (`AnalyticsPage`, `IntelligencePage`): Roboto chart legends, axis ticks, system advice, and mentor dialogs.
