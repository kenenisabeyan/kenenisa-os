import { Request, Response, NextFunction } from 'express';
import { ResultIntelligenceService } from './result-intelligence.service.js';
import { ExcelExportService } from './excel-export.service.js';
import { resultQuerySchema, exportQuerySchema } from '@kenenisa-os/shared';
import { BadRequestError } from '../../utils/errors.js';

export class ResultsController {
  /**
   * GET /api/v1/results
   */
  static async getResults(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const parsed = resultQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError('Invalid query parameters', parsed.error.format());
      }

      const result = await ResultIntelligenceService.getDetailedResults(userId, parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/overview
   */
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fromDate, toDate, horizon } = req.query;
      const overview = await ResultIntelligenceService.getResultOverview(userId, {
        fromDate: fromDate as string,
        toDate: toDate as string,
        horizon: horizon as any,
      });

      res.json(overview);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/trends
   */
  static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { scope, fromDate, toDate } = req.query;
      const trends = await ResultIntelligenceService.getResultTrends(userId, {
        scope: scope as string,
        fromDate: fromDate as string,
        toDate: toDate as string,
      });

      res.json(trends);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/recommendations
   */
  static async getRecommendations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const recommendations = await ResultIntelligenceService.getRecommendations(userId);
      res.json(recommendations);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/patterns
   */
  static async getPatterns(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const patterns = await ResultIntelligenceService.detectPatterns(userId);
      res.json(patterns);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/analysis
   */
  static async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fromDate, toDate, horizon } = req.query;
      const analysis = await ResultIntelligenceService.getResultAnalysis(userId, {
        fromDate: fromDate as string,
        toDate: toDate as string,
        horizon: horizon as any,
      });

      res.json(analysis);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/export/preview
   */
  static async getExportPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const parsed = exportQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError('Invalid export query parameters', parsed.error.format());
      }

      const previewData = await ExcelExportService.generateSpreadsheetReport(userId, parsed.data as any);
      res.json(previewData);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/timeline
   */
  static async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { fromDate, toDate } = req.query;
      const timeline = await ResultIntelligenceService.getTimeline(userId, {
        fromDate: fromDate as string,
        toDate: toDate as string,
      });
      res.json(timeline);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/comparison
   */
  static async getPeriodComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { scope } = req.query;
      const comparison = await ResultIntelligenceService.getPeriodComparison(userId, (scope as string) || 'week');
      res.json(comparison);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/workstreams
   */
  static async getWorkstreamBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const breakdown = await ResultIntelligenceService.getWorkstreamBreakdown(userId);
      res.json(breakdown);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/projects
   */
  static async getProjectBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const breakdown = await ResultIntelligenceService.getProjectBreakdown(userId);
      res.json(breakdown);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/capacity-analysis
   */
  static async getCapacityAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const analysis = await ResultIntelligenceService.getCapacityAnalysis(userId);
      res.json(analysis);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/results/export/xlsx
   */
  static async downloadXlsx(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const parsed = exportQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError('Invalid export query parameters', parsed.error.format());
      }

      const buffer = await ExcelExportService.generateXlsxBuffer(userId, parsed.data as any);

      const filename = `kenenisa-os-results-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) {
      next(err);
    }
  }
}
