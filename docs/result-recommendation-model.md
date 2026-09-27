# KENENISA OS — Factual Recommendation & Advisory Model

ID: `ADV-001`  
Status: `APPROVED`

## Overview

The Recommendation Engine provides actionable next steps (Advance Actions) by coupling outcome tracking results with the deterministic Next Best Action engine.

---

## 1. Actionable Next Actions Ranking Rules

Recommendations are ranked deterministically by:
1. **Unblocking Upstream Dependencies (`RESOLVE_BLOCKER`)**: Priority P0/P1 items blocked by unresolved tasks.
2. **Reviewing Schedule Expirations (`REVIEW_MISSED`)**: Items that passed schedule window without recorded completion proof.
3. **Carrying Forward Incomplete Items (`CARRY_FORWARD`)**: Unfinished outcomes from previous weekly reviews.
4. **Executing Ready Tasks (`EXECUTE_NEXT`)**: Unblocked, highest-priority ready tasks from the Next Best Action queue.

---

## 2. Non-Judgmental AI Advisory Boundaries

The Intelligence Core provides factual explanations based strictly on empirical telemetries:
- **Allowed**: Describing task completion rates, unblocking dependencies, noting schedule expirations.
- **Forbidden**: Making psychological, character, or discipline judgments ("lazy", "disorganized").
- **Telemetry Deficit**: If evidence is insufficient, the system explicitly reports "Insufficient telemetry to determine cause".
