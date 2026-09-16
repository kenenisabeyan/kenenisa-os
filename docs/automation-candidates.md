# KENENISA OS — Automation Candidates & Safety Catalog

**Project**: KENENISA OS — Personal 5th-Year Engineering & Career Operating System  
**Document Identifier**: `v1.0.0-automation-candidates`  
**Date**: `2026-09-16`  
**Status**: `OPERATIONAL CATALOG`  

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

## 2. Evaluated Automation Candidates

| ID | Repetitive Action / Trigger | Operational Frequency | Current Manual Steps | Risk Level | Potential Benefit | Required Dependency | Strategic Recommendation | Notes / Safety Protocol |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| **`AUTO-001`** | **Daily Capacity Rollover** | Daily | 3 steps (Check yesterday's incomplete tasks, manually reschedule to today) | **LOW** | Saves ~3 mins daily; prevents forgotten overdue tasks | Capacity Engine | `AUTOMATE_LATER` | Auto-flag uncompleted time-blocks as "Rollover Candidates" on morning Command Center view. Require 1-click user confirmation. |
| **`AUTO-002`** | **Git Commit Evidence Linker** | Per Commit | 4 steps (Copy Git commit SHA, open `/evidence`, paste URL, select project) | **LOW** | Eliminates manual proof logging; 100% accurate evidence trail | Webhook / CLI Tool | `AUTOMATE_LATER` | Local Git hook parses commit message for `#task-id` tag and automatically posts Evidence Artifact to REST API endpoint (`POST /evidence`). |
| **`AUTO-003`** | **Weekly Retrospective Pre-fill** | Weekly | 5 steps (Review completed tasks, count minutes, calculate velocity) | **LOW** | Saves ~10 mins during Sunday weekly review | Analytics Engine | `SIMPLIFY_NOW` | Automatically aggregate completed tasks, total focused minutes, and skill gains when user opens `/reviews/new`. |
| **`AUTO-004`** | **Stale Project Health Alert** | Weekly | Manual inspection across 10+ projects to find inactive projects | **LOW** | Prevents forgotten projects; maintains clean active backlog | Project Domain | `AUTOMATE_LATER` | Flag projects with zero completed tasks or activity for > 14 days as `STALE` on Command Center dashboard. |
| **`AUTO-005`** | **Autonomous Job Application Submissions** | Occasional | Manual application filling and portfolio submission | **CRITICAL** | High time savings | External Web APIs | `DO_NOT_AUTOMATE` | **STRICTLY PROHIBITED**. Violates safety rules. Career applications require 100% explicit human decision and review. |

---

## 3. Automation Implementation Principles

1. **Two-Phase Action Confirmation**: Any AI or automated suggestion that modifies database state must follow `PROPOSE -> CONFIRM -> EXECUTE`.
2. **Explicit Opt-In**: Automated routines must be togglable per user in `UserSettings`.
3. **Audit Logging**: Every automated state change must record an entry in the system audit log with `source: 'AUTOMATION_ENGINE'`.
