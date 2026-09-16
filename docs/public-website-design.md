# KENENISA OS — Public Website Design Architecture & Identity

## 1. Executive Summary

KENENISA OS features a dedicated pre-authentication public product website that introduces the **Personal Engineering & Career Operating System** before a user signs in to their private operating environment.

Designed with restraint, engineering clarity, and typography discipline (exclusive Google Roboto font family), the public website communicates the methodology:

```text
Direction → Goals → Projects → Milestones → Tasks → Planning → Execution → Evidence → Review → Improvement
```

---

## 2. Core Identity & Color Palette System

The public website relies on a clean `#F8FAFC` light canvas, crisp `#FFFFFF` cards with subtle `border-slate-200/90` borders, and semantic role-based accents:

| Color Code | Role & Scope |
| :--- | :--- |
| `#3B82F6` | Primary actions, navigation highlights, CTA buttons |
| `#3AB1EC` | Technology identity, system context, planning capacity |
| `#6366F1` | Focus, project structure, active states |
| `#A855F7` | Intelligence Core, AI advisory layer |
| `#FF5A00` | Task execution, attention, priority items |
| `#FFD700` | Important milestones, career highlights |
| `#22C55E` | Success, verified evidence, completion proof |
| `#F8FAFC` | Primary light background canvas |

---

## 3. Public vs Private Security Boundary

- **Public Website (`/`, `/how-it-works`, `/capabilities`, `/about`)**: Serves public product methodology, capability explanations, system architecture flow, and philosophy without exposing any private user data.
- **Private Operating Environment (`/app/*`)**: Requires authentication via HTTP-Only session cookies. Hosts user workstreams, strategic goals, active tasks, capacity schedule, learning logs, evidence items, and intelligence advisory.

---

## 4. Typography & Layout Specifications

- **Global Font**: Google Roboto (`font-sans`) exclusively across headings, body text, buttons, tags, and microcopy.
- **Header**: Fixed top header (`h-16`) with brand icon (`K`), title, 4 navigation links, and Sign In / Get Started actions.
- **Mobile Menu**: Responsive hamburger drawer for touch screens (`< 768px`).
- **Footer**: Unified global footer with product links, access shortcuts, copyright notice, and core design tenets.
