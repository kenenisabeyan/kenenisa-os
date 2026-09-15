import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service.js';
import { createProjectSchema, updateProjectSchema, projectQuerySchema } from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const service = new ProjectService();

export async function listProjectsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const query = projectQuerySchema.parse(req.query);
    const result = await service.listProjects(userId, query);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Projects retrieved successfully',
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

export async function getProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const item = await service.getProjectById(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Project retrieved successfully',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = createProjectSchema.parse(req.body);
    const created = await service.createProject(userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Project created successfully',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateProjectSchema.parse(req.body);
    const updated = await service.updateProject(id, userId, body);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function archiveProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const archived = await service.archiveProject(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Project archived successfully',
      data: archived,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const completed = await service.completeProject(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Project marked as complete',
      data: completed,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reopenProjectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const reopened = await service.reopenProject(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Project reopened',
      data: reopened,
    });
  } catch (error) {
    return next(error);
  }
}
