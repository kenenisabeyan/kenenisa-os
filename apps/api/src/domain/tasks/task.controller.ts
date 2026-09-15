import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  createTaskDependencySchema,
  reorderTasksSchema,
} from '@kenenisa-os/shared';
import { sendSuccess } from '../../utils/response.js';

const service = new TaskService();

export async function listTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const query = taskQuerySchema.parse(req.query);
    const result = await service.getTasks(userId, query);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Tasks retrieved successfully',
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

export async function getTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const item = await service.getTaskById(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task retrieved successfully',
      data: item,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = createTaskSchema.parse(req.body);
    const created = await service.createTask(userId, {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    });

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Task created successfully',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const body = updateTaskSchema.parse(req.body);
    const updated = await service.updateTask(id, userId, {
      ...body,
      startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : undefined,
      dueDate: body.dueDate !== undefined ? (body.dueDate ? new Date(body.dueDate) : null) : undefined,
    });


    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

export async function startTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const started = await service.startTask(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task started successfully',
      data: started,
    });
  } catch (error) {
    return next(error);
  }
}

export async function blockTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const blocked = await service.blockTask(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task marked as blocked',
      data: blocked,
    });
  } catch (error) {
    return next(error);
  }
}

export async function completeTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const completed = await service.completeTask(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task marked as complete',
      data: completed,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reopenTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const reopened = await service.reopenTask(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task reopened',
      data: reopened,
    });
  } catch (error) {
    return next(error);
  }
}

export async function cancelTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const id = req.params.id as string;
    const cancelled = await service.cancelTask(id, userId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Task cancelled',
      data: cancelled,
    });
  } catch (error) {
    return next(error);
  }
}

export async function reorderTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const body = reorderTasksSchema.parse(req.body);
    await service.reorderTasks(userId, body.items);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Tasks reordered successfully',
      data: { success: true },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createSubtaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const parentTaskId = req.params.id as string;
    const body = createTaskSchema.parse(req.body);

    const subtask = await service.createSubtask(userId, parentTaskId, {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    });

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Subtask created successfully',
      data: subtask,
    });
  } catch (error) {
    return next(error);
  }
}

export async function addDependencyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const dependentTaskId = req.params.id as string;
    const body = createTaskDependencySchema.parse(req.body);

    const dependency = await service.addDependency(
      userId,
      dependentTaskId,
      body.blockingTaskId,
      body.dependencyType,
    );

    return sendSuccess({
      res,
      req,
      statusCode: 201,
      message: 'Dependency added successfully',
      data: dependency,
    });
  } catch (error) {
    return next(error);
  }
}

export async function removeDependencyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.auth!.userId;
    const dependentTaskId = req.params.id as string;
    const dependencyId = req.params.dependencyId as string;

    await service.removeDependency(userId, dependentTaskId, dependencyId);

    return sendSuccess({
      res,
      req,
      statusCode: 200,
      message: 'Dependency removed successfully',
      data: { success: true },
    });
  } catch (error) {
    return next(error);
  }
}
