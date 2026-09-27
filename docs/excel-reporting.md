# KENENISA OS — In-App Spreadsheet & Excel Export Architecture

ID: `XLS-001`  
Status: `APPROVED`

## Overview

KENENISA OS provides an in-app spreadsheet workspace (no download required) and binary `.xlsx` workbook export capabilities. The database remains the authoritative single source of truth at all times.

---

## 1. Single Dataset Architecture

```text
PostgreSQL (Authoritative Source of Truth)
       ↓
Domain & Result Services
       ↓
Report Dataset (/api/v1/results/export/preview)
   ↙                       ↘
In-App Spreadsheet UI     ExcelJS Generator
 (Preview Table Grid)     (Binary .xlsx Download)
```

This ensures the in-app preview table and downloaded `.xlsx` workbook render identical data.

---

## 2. Multi-Sheet Workbook Structure

Generated `.xlsx` workbooks include structured worksheets:
1. `Summary`: Period metrics, total planned, completed, missed, blocked, and trends.
2. `Outcomes`: Detailed list of outcomes, dates, horizons, expected/actual results, statuses, and sources.
3. `Recommendations`: Actionable advance recommendations and dependency resolution steps.

---

## 3. Export Scopes & File Security

- **Scopes**: `current` (current filters), `day`, `week`, `month`, `year`, `custom`, `full`.
- **Filename Pattern**: `kenenisa-os-results-YYYY-MM-DD.xlsx`.
- **Security**: Strict user ownership scoping (`userId`), authorization checks, IDOR protection, and complete exclusion of passwords, session tokens, or API keys.
- **Audit Logging**: Export events logged to `ResultExportLog`.
