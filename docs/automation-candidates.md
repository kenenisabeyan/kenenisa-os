# KENENISA OS — Automation Candidates & Safety Catalog

**Project**: KENENISA OS — Personal 5th-Year Engineering & Career Operating System  
**Document Identifier**: `v1.0.0-automation-candidates`  
**Date**: `2026-09-16`  
**Status**: `SAFE WORKFLOW AUTOMATION VERIFIED`  

---

## 1. Governance & Safety Rules for Automation

Automation in **KENENISA OS** must enhance focus without removing human ownership or introducing unsafe autonomous mutations.

### ⛔ NON-NEGOTIABLE SAFETY BOUNDARIES (DO NOT AUTOMATE)
The following actions **MUST NEVER** be executed autonomously by background scripts, AI agents, or automated triggers:
1. **Job & Career Applications**: Never auto-submit job applications, emails, or recruiter messages.
2. **External Messaging & Communications**: Never auto-send emails, client messages, or social posts.
3. **Financial & Commercial Contracts**: Never accept freelance offers or process financial transactions.
4. **Data Destruction & Schema Changes**: Never perform cascade deletions, table drops, or production DB migrations.
5. **Production Deployment & Credentials**: Never execute production releases or rotate active authentication keys without manual confirmation.

---

## 2. Automation Candidates Register

### AUT-001: Weekly Retrospective & Review Context Pre-Fill
- **Workflow**: Weekly Retrospective (`/reviews/new`)
- **Evidence Link**: `RWE-007` (Evidence Log), `WF-007` (Friction Matrix)
- **Operational Frequency**: Weekly (Sundays)
- **Current Manual Process**: User previously typed completed task names, calculated focus minutes, and looked up velocity.
- **Deterministic Rule**: `AnalyticsService.getReviewAnalytics` auto-aggregates week's completed tasks, total focus minutes, and milestone completions when initializing review draft.
- **Proposed Automation**: Read-only pre-fill of draft review context.
- **Risk**: `LOW` (Read-only aggregation; user reviews and edits before saving).
- **Reversibility**: `100% REVERSIBLE` (Draft text can be edited or discarded).
- **User Confirmation Required**: **YES** (User explicitly clicks "Save Review").
- **Audit Requirement**: Audit log entry recorded on review submission.
- **Expected Benefit**: Saves ~10 minutes per weekly retrospective; eliminates manual copy-pasting.
- **Implementation Status**: `VERIFIED` (Layer 2 Safe Workflow Assistance).

---

### AUT-002: Daily Capacity & Rollover Candidate Surface
- **Workflow**: Daily Planning & Morning Alignment (`/dashboard`, `/planning`)
- **Evidence Link**: `RWE-005` (Evidence Log), `WF-001` (Friction Matrix)
- **Operational Frequency**: Daily (Mornings)
- **Current Manual Process**: User checked yesterday's schedule for uncompleted tasks and manually re-scheduled them.
- **Deterministic Rule**: System checks uncompleted time-blocks from previous date (`status != DONE`) and surfaces them as "Rollover Candidates" on Command Center.
- **Proposed Automation**: Surface rollover suggestions on morning Command Center card with 1-click schedule option.
- **Risk**: `LOW` (Read-only suggestion UI).
- **Reversibility**: `100% REVERSIBLE`.
- **User Confirmation Required**: **YES** (User clicks "Schedule Today" to move).
- **Audit Requirement**: Standard task update log.
- **Expected Benefit**: Prevents forgotten overdue tasks; saves ~3 minutes daily.
- **Implementation Status**: `VERIFIED` (Layer 2 Safe Workflow Assistance).

---

### AUT-003: Stale Project Health Alerting
- **Workflow**: Command Center & Project Workspace (`/dashboard`, `/projects`)
- **Evidence Link**: `UOM-004` (Usage Matrix)
- **Operational Frequency**: Continuous
- **Current Manual Process**: User manually clicked through 10+ project cards to check if any were inactive.
- **Deterministic Rule**: Projects with zero completed tasks or activity for > 14 days are flagged with a yellow `STALE` indicator.
- **Proposed Automation**: Read-only visual badge on Command Center project list.
- **Risk**: `LOW` (Visual status tag only; does not mutate project state).
- **Reversibility**: `N/A` (Read-only status flag).
- **User Confirmation Required**: **NO** (Read-only visual indicator).
- **Audit Requirement**: None.
- **Expected Benefit**: Prevents forgotten inactive projects; maintains clean backlog.
- **Implementation Status**: `VERIFIED` (Layer 1 Derived Information).

---

### AUT-004: Git Commit Evidence Proposal Generator
- **Workflow**: Evidence Capture (`/evidence`)
- **Evidence Link**: `RWE-008` (Evidence Log), `WF-003` (Friction Matrix)
- **Operational Frequency**: Per Git Commit / Milestone
- **Current Manual Process**: Copy SHA, open `/evidence`, paste URL, select project.
- **Deterministic Rule**: Parse commit message for `#task-<uuid>` tag and prepare Evidence Artifact proposal.
- **Proposed Automation**: REST endpoint `/api/v1/evidence/propose` prepares draft artifact proposal.
- **Risk**: `LOW` (Returns proposal state; user must confirm).
- **Reversibility**: `100% REVERSIBLE`.
- **User Confirmation Required**: **YES** (User clicks "Confirm Evidence").
- **Audit Requirement**: Audit log on confirmation.
- **Expected Benefit**: Automates proof capture trail; 100% accurate evidence.
- **Implementation Status**: `AUTOMATE_LATER` (Scheduled for CLI integration).

---

### AUT-005: Autonomous Job Application Submissions
- **Workflow**: Opportunities Pipeline (`/opportunities`)
- **Evidence Link**: `AUTO-005` in Safety Catalog
- **Operational Frequency**: Occasional
- **Current Manual Process**: Fill out application forms, submit resume.
- **Strategic Recommendation**: **`DO_NOT_AUTOMATE`** (**STRICTLY PROHIBITED**).
- **Risk**: `CRITICAL` (Submitting external applications, messages, or financial commitments autonomously creates severe reputation, employment, and legal risk).
- **Reversibility**: `NON-REVERSIBLE`.
- **User Confirmation Required**: **MANDATORY** (Career applications require 100% explicit human decision and action).
- **Implementation Status**: `REJECTED` (Strict Safety Boundary Violation).
