import { Router } from 'express';
import { AcademicController } from './academic.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const academicRouter = Router();

academicRouter.use(requireAuth);

academicRouter.get('/semesters', (req, res, next) => AcademicController.getSemesters(req, res, next));
academicRouter.post('/semesters', (req, res, next) => AcademicController.createSemester(req, res, next));

academicRouter.get('/courses', (req, res, next) => AcademicController.getCourses(req, res, next));
academicRouter.get('/courses/:id', (req, res, next) => AcademicController.getCourseById(req, res, next));
academicRouter.post('/courses', (req, res, next) => AcademicController.createCourse(req, res, next));
academicRouter.patch('/courses/:id', (req, res, next) => AcademicController.updateCourse(req, res, next));
academicRouter.delete('/courses/:id', (req, res, next) => AcademicController.deleteCourse(req, res, next));

