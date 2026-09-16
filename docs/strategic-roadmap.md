# KENENISA OS — Authoritative Strategic Roadmap Reset

**Project**: KENENISA OS — Personal 5th-Year Engineering & Career Operating System  
**Roadmap Identifier**: `v1.0.0-roadmap`  
**Date**: `2026-09-16`  
**Status**: `ACTIVE ROADMAP RESET`  

---

## 1. Roadmap Architecture & Tiers

The roadmap reset organizes future engineering effort into five transparent categories: `NOW`, `NEXT`, `LATER`, `DEFERRED`, and `REMOVED`.

```text
┌─────────────────────────────────────────────────────────────┐
│ NOW       Immediate verified priorities (Deployment SOPs,  │
│           Playwright E2E integration, bounded pagination)   │
├─────────────────────────────────────────────────────────────┤
│ NEXT      High-value dependencies following NOW work       │
│           (PDF evidence export, AI token window bounds)     │
├─────────────────────────────────────────────────────────────┤
│ LATER     Useful, non-urgent enhancements                   │
│           (Dark/light theme toggle, custom export tools)    │
├─────────────────────────────────────────────────────────────┤
│ DEFERRED  Ideas lacking empirical evidence                  │
│           (Microservices, Redis queues, multi-tenant SaaS)  │
├─────────────────────────────────────────────────────────────┤
│ REMOVED   Features outside strategic product boundary       │
│           (Generic CRM, Notion clone, autonomous LLM DB)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. NOW (Active Immediate Priorities)

| Item ID | Title | Problem / Objective | Evidence Source | Priority | Dependencies | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NOW-01** | Production Env Injection | Provide live `DATABASE_URL` and `SESSION_SECRET` in cloud provider dashboard | `docs/deployment.md` | P0 | External Hosting | `GET /ready` returns HTTP 200 OK |
| **NOW-02** | Playwright E2E Suite | Execute Playwright E2E smoke tests against production build dist assets | `PE-008` in `docs/product-evolution-matrix.md` | P1 | Web Dist Build | `npx playwright test` exits code 0 |
| **NOW-03** | Bounded Analytics Pagination | Add limit/offset parameters to multi-period analytics query endpoints | `PE-007` in `docs/product-evolution-matrix.md` | P2 | Express REST API | Vitest `analytics.test.ts` & latency check |

### NOW Dependency Graph
```text
NOW-01 (Prod Env Setup) ──► NOW-02 (Playwright E2E) ──► NOW-03 (Analytics Limits)
```

---

## 3. NEXT (Validated Pipeline Work)

| Item ID | Title | Problem / Objective | Evidence Source | Priority | Dependencies | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NEXT-01** | Automated PDF Evidence Export | Export verified evidence artifacts and weekly retrospectives as PDF | Personal workflow requirement | P2 | Evidence Engine | Generated PDF file inspection |
| **NEXT-02** | AI Context Token Optimization | Dynamic prompt context serialization to reduce LLM token overhead | `PE-009` in `docs/product-evolution-matrix.md` | P2 | Intelligence Core | Token length inspection (< 30% overhead) |

### NEXT Dependency Graph
```text
NOW-03 (Analytics Limits) ──► NEXT-01 (PDF Export) ──► NEXT-02 (AI Token Bounds)
```

---

## 4. LATER (Non-Urgent Enhancements)

* **LATER-01**: Custom CSV/JSON data export tools for personal analytics history.
* **LATER-02**: Expanded keyboard shortcut cheatsheet modal for rapid workspace navigation.
* **LATER-03**: Custom theme accent selector for workspace personalization.

---

## 5. DEFERRED (Lacking Evidence / Deferred)

* **DEFERRED-01**: Microservice architecture split (`INSUFFICIENT EVIDENCE` of monolith bottleneck).
* **DEFERRED-02**: Redis queue installation (`INSUFFICIENT EVIDENCE` of job queue necessity).
* **DEFERRED-03**: Multi-tenant team SaaS capabilities (Outside strategic single-user product boundary).
* **DEFERRED-04**: Higher-Level Strategic Planning Layer (`INSUFFICIENT EVIDENCE` of 6-level hierarchy limits; existing Workstream/Goal/Project models provide 100% full strategic traceability).

---

## 6. REMOVED (Outside Product Boundary)

* **REMOVED-01**: Generic CRM pipeline and sales forecasting tools (Contradicts Personal Engineering OS boundary).
* **REMOVED-02**: Freeform Notion-like wiki canvas (Contradicts structured 6-level hierarchy model).
* **REMOVED-03**: Autonomous AI database write permissions (Violates two-phase action confirmation protocol).

---

## 7. Development Capacity Principle

Every roadmap entry must satisfy:
1. **WHY NOW?**: Supported by empirical production evidence or critical operational dependency.
2. **WHAT DOES IT DEPEND ON?**: Prerequisites clearly identified in dependency graph.
3. **WHAT RISK DOES IT CREATE?**: Zero regression risk to Tier 1 security, auth, or database integrity.
4. **HOW IS IT VERIFIED?**: Measurable automated test commands and quality gates.
