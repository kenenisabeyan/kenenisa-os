import ExcelJS from 'exceljs';
import { prisma } from '../../lib/prisma.js';
import { ResultIntelligenceService } from './result-intelligence.service.js';
import {
  ExportQueryInput,
  SpreadsheetReportDto,
  SpreadsheetSheetDto,
  SpreadsheetColumnDto,
  SpreadsheetRowDto,
} from '@kenenisa-os/shared';

export class ExcelExportService {
  /**
   * Builds the structured spreadsheet dataset for in-app preview or Excel generation
   */
  static async generateSpreadsheetReport(
    userId: string,
    options: ExportQueryInput
  ): Promise<SpreadsheetReportDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true },
    });

    const detailed = await ResultIntelligenceService.getDetailedResults(userId, options);
    const analysis = await ResultIntelligenceService.getResultAnalysis(userId, options);

    const outcomes = detailed.items || [];

    // Sheet 1: Summary
    const summarySheet: SpreadsheetSheetDto = {
      name: 'Summary',
      columns: [
        { key: 'metric', header: 'Metric', width: 28, type: 'string' },
        { key: 'value', header: 'Value', width: 18, type: 'number' },
        { key: 'notes', header: 'Factual Telemetry Notes', width: 45, type: 'string' },
      ],
      rows: [
        { id: 's-1', metric: 'Total Planned Outcomes', value: analysis.overview.totalPlanned, notes: 'Total records created across all horizons' },
        { id: 's-2', metric: 'Completed Outcomes 🟢', value: analysis.overview.completed, notes: 'Authoritatively verified or completed tasks' },
        { id: 's-3', metric: 'Partially Completed Outcomes 🟡', value: analysis.overview.partiallyCompleted, notes: 'Subtask ratio between 1% and 99%' },
        { id: 's-4', metric: 'Missed Outcomes 🔴', value: analysis.overview.missed, notes: 'Schedule window expired without completion evidence' },
        { id: 's-5', metric: 'Blocked Outcomes 🟠', value: analysis.overview.blocked, notes: 'Prevented by open task dependencies' },
        { id: 's-6', metric: 'In Progress Outcomes 🔵', value: analysis.overview.inProgress, notes: 'Active execution underway' },
        { id: 's-7', metric: 'Rescheduled Outcomes ↪', value: analysis.overview.rescheduled, notes: 'Explicitly moved to future schedule' },
        { id: 's-8', metric: 'Cancelled Outcomes ⚫', value: analysis.overview.cancelled, notes: 'Explicitly withdrawn' },
        { id: 's-9', metric: 'Unknown Outcomes ⚪', value: analysis.overview.unknown, notes: 'System lacks sufficient telemetry' },
      ],
      totalRows: 9,
    };

    // Sheet 2: Outcomes
    const outcomeColumns: SpreadsheetColumnDto[] = [
      { key: 'id', header: 'Result ID', width: 36, type: 'string' },
      { key: 'createdAt', header: 'Created Date', width: 20, type: 'date' },
      { key: 'horizon', header: 'Planning Horizon', width: 16, type: 'badge' },
      { key: 'title', header: 'Title', width: 30, type: 'string' },
      { key: 'expectedResult', header: 'Expected Result', width: 35, type: 'string' },
      { key: 'actualResult', header: 'Actual Result', width: 35, type: 'string' },
      { key: 'outcomeState', header: 'Outcome Status', width: 20, type: 'badge' },
      { key: 'source', header: 'Result Source', width: 18, type: 'string' },
      { key: 'plannedMinutes', header: 'Planned Mins', width: 14, type: 'number' },
      { key: 'priority', header: 'Priority', width: 12, type: 'badge' },
      { key: 'workstream', header: 'Workstream', width: 22, type: 'string' },
      { key: 'goal', header: 'Goal', width: 24, type: 'string' },
      { key: 'project', header: 'Project', width: 24, type: 'string' },
      { key: 'task', header: 'Related Task', width: 28, type: 'string' },
      { key: 'evidenceCount', header: 'Evidence Count', width: 14, type: 'number' },
    ];

    const outcomeRows: SpreadsheetRowDto[] = outcomes.map((o) => ({
      id: o.id,
      createdAt: o.createdAt.toISOString(),
      horizon: o.horizon,
      title: o.title,
      expectedResult: o.expectedResult || '—',
      actualResult: o.actualResult || '—',
      outcomeState: o.outcomeState,
      source: o.source || 'AUTOMATIC',
      plannedMinutes: o.plannedMinutes || 0,
      priority: o.priority,
      workstream: o.workstream?.name || '—',
      goal: o.goal?.title || '—',
      project: o.project?.name || '—',
      task: o.task?.title || '—',
      evidenceCount: o.evidenceLinks?.length || 0,
    }));

    const outcomesSheet: SpreadsheetSheetDto = {
      name: 'Outcomes',
      columns: outcomeColumns,
      rows: outcomeRows,
      totalRows: outcomeRows.length,
    };

    // Sheet 3: Recommendations
    const recSheet: SpreadsheetSheetDto = {
      name: 'Recommendations',
      columns: [
        { key: 'actionNumber', header: 'Step #', width: 10, type: 'number' },
        { key: 'title', header: 'Recommended Next Action', width: 32, type: 'string' },
        { key: 'reason', header: 'Factual System Reason', width: 45, type: 'string' },
        { key: 'priority', header: 'Priority', width: 12, type: 'badge' },
        { key: 'actionType', header: 'Action Category', width: 20, type: 'string' },
      ],
      rows: analysis.recommendations.map((r) => ({
        id: r.id,
        actionNumber: r.actionNumber,
        title: r.title,
        reason: r.reason,
        priority: r.priority,
        actionType: r.actionType,
      })),
      totalRows: analysis.recommendations.length,
    };

    const dateRangeFrom = options.fromDate || 'Earliest Record';
    const dateRangeTo = options.toDate || 'Latest Record';

    return {
      title: 'KENENISA OS — Multi-Horizon Result Intelligence Report',
      generatedAt: new Date().toISOString(),
      userDisplayName: user?.displayName || 'Kenenisa',
      scope: options.scope || 'current',
      dateRange: { from: dateRangeFrom, to: dateRangeTo },
      sheets: [summarySheet, outcomesSheet, recSheet],
    };
  }

  /**
   * Generates a binary .xlsx workbook buffer containing formatted sheets
   */
  static async generateXlsxBuffer(
    userId: string,
    options: ExportQueryInput
  ): Promise<Buffer> {
    const reportData = await this.generateSpreadsheetReport(userId, options);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KENENISA OS Intelligence Core';
    workbook.lastModifiedBy = reportData.userDisplayName;
    workbook.created = new Date();

    for (const sheetData of reportData.sheets) {
      const sheet = workbook.addWorksheet(sheetData.name, {
        views: [{ state: 'frozen', ySplit: 1 }],
      });

      // Define columns
      sheet.columns = sheetData.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width,
      }));

      // Style header row
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Dark slate header
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

      // Add data rows
      for (const rowData of sheetData.rows) {
        sheet.addRow(rowData);
      }
    }

    // Log the export event
    await this.logExportEvent(
      userId,
      options.scope || 'current',
      'XLSX',
      reportData.sheets[1]?.totalRows || 0,
      options.fromDate,
      options.toDate
    );

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Records audit event for export generation
   */
  static async logExportEvent(
    userId: string,
    scope: string,
    format: string,
    recordCount: number,
    rangeFrom?: string,
    rangeTo?: string
  ) {
    try {
      await prisma.resultExportLog.create({
        data: {
          userId,
          scope,
          format,
          recordCount,
          rangeFrom,
          rangeTo,
        },
      });
    } catch {
      // Ignore logging failures gracefully
    }
  }
}
