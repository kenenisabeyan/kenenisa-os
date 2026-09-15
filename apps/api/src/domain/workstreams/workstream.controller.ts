import { Request, Response, NextFunction } from 'express';
import { WorkstreamService } from './workstream.service.js';
import {
  createWorkstreamSchema,
  updateWorkstreamSchema,
  workstreamQuerySchema,
} from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const service = new WorkstreamService();

export async function listWorkstreamsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const query = workstreamQuerySchema.parse(req.query);
    const result = await service.listWorkstreams(userId, query);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Workstreams retrieved successfully',
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.page < result.totalPages,
        hasPrevPage: result.page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getWorkstreamHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const item = await service.getWorkstreamById(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Workstream retrieved successfully',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createWorkstreamHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = createWorkstreamSchema.parse(req.body);
    const created = await service.createWorkstream(userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Workstream created successfully',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateWorkstreamHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateWorkstreamSchema.parse(req.body);
    const updated = await service.updateWorkstream(id, userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Workstream updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function archiveWorkstreamHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const archived = await service.archiveWorkstream(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Workstream archived successfully',
      data: archived,
    });
  } catch (error) {
    return next(error);
  }
}
