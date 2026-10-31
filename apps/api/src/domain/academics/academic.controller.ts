import type { Request, Response, NextFunction } from 'express';
import { AcademicService } from './academic.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import {
  createAcademicSemesterSchema,
  createAcademicCourseSchema,
  updateAcademicCourseSchema,
} from '@kenenisa-os/shared';

export class AcademicController {
  public static async getSemesters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const semesters = await AcademicService.getSemesters(authReq.user.id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Academic semesters retrieved',
        data: { semesters },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createSemester(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validated = createAcademicSemesterSchema.parse(req.body);
      const semester = await AcademicService.createSemester(authReq.user.id, validated);
      sendSuccess({
        res,
        req,
        statusCode: 201,
        message: 'Academic semester created successfully',
        data: { semester },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const semesterId = req.query.semesterId as string | undefined;
      const courses = await AcademicService.getCourses(authReq.user.id, semesterId);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Academic courses retrieved',
        data: { courses },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const course = await AcademicService.getCourseById(authReq.user.id, id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Course details retrieved',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const validated = createAcademicCourseSchema.parse(req.body);
      const course = await AcademicService.createCourse(authReq.user.id, validated);
      sendSuccess({
        res,
        req,
        statusCode: 201,
        message: 'Course added to semester successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      const validated = updateAcademicCourseSchema.parse(req.body);
      const course = await AcademicService.updateCourse(authReq.user.id, id, validated);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Course updated successfully',
        data: { course },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params.id as string;
      await AcademicService.deleteCourse(authReq.user.id, id);
      sendSuccess({
        res,
        req,
        statusCode: 200,
        message: 'Course removed from semester',
        data: { success: true },
      });
    } catch (error) {
      next(error);
    }
  }
}

