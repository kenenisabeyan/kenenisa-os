import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import type {
  AcademicSemesterDto,
  AcademicCourseDto,
  AssessmentDateItem,
  AssignmentItem,
  TestOrExamItem,
  StudyTopicItem,
  LearningResourceItem,
  AcademicStatus,
  UnderstandingLevel,
} from '@kenenisa-os/shared';
import { Prisma } from '@prisma/client';

export class AcademicService {
  /**
   * Retrieves all academic semesters for the user.
   */
  public static async getSemesters(userId: string): Promise<AcademicSemesterDto[]> {
    const list = await prisma.academicSemester.findMany({
      where: { userId },
      include: {
        courses: {
          include: {
            project: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((s) => ({
      id: s.id,
      userId: s.userId,
      academicYear: s.academicYear,
      semester: s.semester,
      level: s.level,
      startDate: s.startDate ? s.startDate.toISOString() : null,
      endDate: s.endDate ? s.endDate.toISOString() : null,
      status: s.status,
      notes: s.notes,
      courses: s.courses.map((c) => ({
        id: c.id,
        userId: c.userId,
        semesterId: c.semesterId,
        code: c.code,
        title: c.title,
        creditHours: c.creditHours,
        instructor: c.instructor,
        assessmentDates: (c.assessmentDates as unknown as AssessmentDateItem[]) || null,
        assignments: (c.assignments as unknown as AssignmentItem[]) || null,
        testsAndExams: (c.testsAndExams as unknown as TestOrExamItem[]) || null,
        studyTopics: (c.studyTopics as unknown as StudyTopicItem[]) || null,
        learningResources: (c.learningResources as unknown as LearningResourceItem[]) || null,
        currentUnderstanding: c.currentUnderstanding as unknown as UnderstandingLevel,
        academicStatus: c.academicStatus as unknown as AcademicStatus,
        notes: c.notes,
        completionRequirements: c.completionRequirements,
        projectId: c.projectId,
        project: c.project || null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  }

  /**
   * Creates a new academic semester.
   */
  public static async createSemester(
    userId: string,
    input: {
      academicYear?: string;
      semester?: string;
      level?: string;
      startDate?: string | null;
      endDate?: string | null;
      status?: string;
      notes?: string | null;
    }
  ): Promise<AcademicSemesterDto> {
    const academicYear = input.academicYear || '2026/2027';
    const semester = input.semester || 'First Semester';
    const level = input.level || 'Fifth Year';

    const existing = await prisma.academicSemester.findUnique({
      where: {
        userId_academicYear_semester: {
          userId,
          academicYear,
          semester,
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Semester "${semester}" in "${academicYear}" already exists.`);
    }

    const created = await prisma.academicSemester.create({
      data: {
        userId,
        academicYear,
        semester,
        level,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status || 'ACTIVE',
        notes: input.notes || null,
      },
      include: {
        courses: {
          include: {
            project: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      academicYear: created.academicYear,
      semester: created.semester,
      level: created.level,
      startDate: created.startDate ? created.startDate.toISOString() : null,
      endDate: created.endDate ? created.endDate.toISOString() : null,
      status: created.status,
      notes: created.notes,
      courses: [],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * Retrieves all courses, optionally filtered by semester.
   */
  public static async getCourses(userId: string, semesterId?: string): Promise<AcademicCourseDto[]> {
    const courses = await prisma.academicCourse.findMany({
      where: {
        userId,
        ...(semesterId ? { semesterId } : {}),
      },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    return courses.map((c) => ({
      id: c.id,
      userId: c.userId,
      semesterId: c.semesterId,
      code: c.code,
      title: c.title,
      creditHours: c.creditHours,
      instructor: c.instructor,
      assessmentDates: (c.assessmentDates as unknown as AssessmentDateItem[]) || null,
      assignments: (c.assignments as unknown as AssignmentItem[]) || null,
      testsAndExams: (c.testsAndExams as unknown as TestOrExamItem[]) || null,
      studyTopics: (c.studyTopics as unknown as StudyTopicItem[]) || null,
      learningResources: (c.learningResources as unknown as LearningResourceItem[]) || null,
      currentUnderstanding: c.currentUnderstanding as unknown as UnderstandingLevel,
      academicStatus: c.academicStatus as unknown as AcademicStatus,
      notes: c.notes,
      completionRequirements: c.completionRequirements,
      projectId: c.projectId,
      project: c.project || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));
  }

  /**
   * Retrieves a single course by ID.
   */
  public static async getCourseById(userId: string, courseId: string): Promise<AcademicCourseDto> {
    const course = await prisma.academicCourse.findFirst({
      where: { id: courseId, userId },
      include: {
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Academic course not found.');
    }

    return {
      id: course.id,
      userId: course.userId,
      semesterId: course.semesterId,
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      instructor: course.instructor,
      assessmentDates: (course.assessmentDates as unknown as AssessmentDateItem[]) || null,
      assignments: (course.assignments as unknown as AssignmentItem[]) || null,
      testsAndExams: (course.testsAndExams as unknown as TestOrExamItem[]) || null,
      studyTopics: (course.studyTopics as unknown as StudyTopicItem[]) || null,
      learningResources: (course.learningResources as unknown as LearningResourceItem[]) || null,
      currentUnderstanding: course.currentUnderstanding as unknown as UnderstandingLevel,
      academicStatus: course.academicStatus as unknown as AcademicStatus,
      notes: course.notes,
      completionRequirements: course.completionRequirements,
      projectId: course.projectId,
      project: course.project || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new course under an academic semester.
   */
  public static async createCourse(
    userId: string,
    input: {
      semesterId: string;
      code?: string | null;
      title: string;
      creditHours?: number | null;
      instructor?: string | null;
      assessmentDates?: AssessmentDateItem[] | null;
      assignments?: AssignmentItem[] | null;
      testsAndExams?: TestOrExamItem[] | null;
      studyTopics?: StudyTopicItem[] | null;
      learningResources?: LearningResourceItem[] | null;
      currentUnderstanding?: UnderstandingLevel;
      academicStatus?: AcademicStatus;
      notes?: string | null;
      completionRequirements?: string | null;
      projectId?: string | null;
    }
  ): Promise<AcademicCourseDto> {
    const semester = await prisma.academicSemester.findFirst({
      where: { id: input.semesterId, userId },
    });

    if (!semester) {
      throw new NotFoundError('Academic semester not found.');
    }

    const existing = await prisma.academicCourse.findUnique({
      where: {
        semesterId_title: {
          semesterId: input.semesterId,
          title: input.title.trim(),
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Course "${input.title.trim()}" already exists in this semester.`);
    }

    const created = await prisma.academicCourse.create({
      data: {
        userId,
        semesterId: input.semesterId,
        code: input.code?.trim() || null,
        title: input.title.trim(),
        creditHours: input.creditHours || null,
        instructor: input.instructor?.trim() || null,
        assessmentDates: input.assessmentDates ? (input.assessmentDates as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        assignments: input.assignments ? (input.assignments as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        testsAndExams: input.testsAndExams ? (input.testsAndExams as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        studyTopics: input.studyTopics ? (input.studyTopics as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        learningResources: input.learningResources ? (input.learningResources as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        currentUnderstanding: (input.currentUnderstanding || 'DEVELOPING') as unknown as import('@prisma/client').UnderstandingLevel,
        academicStatus: (input.academicStatus || 'ENROLLED') as unknown as import('@prisma/client').AcademicStatus,
        notes: input.notes?.trim() || null,
        completionRequirements: input.completionRequirements?.trim() || null,
        projectId: input.projectId || null,
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return {
      id: created.id,
      userId: created.userId,
      semesterId: created.semesterId,
      code: created.code,
      title: created.title,
      creditHours: created.creditHours,
      instructor: created.instructor,
      assessmentDates: (created.assessmentDates as unknown as AssessmentDateItem[]) || null,
      assignments: (created.assignments as unknown as AssignmentItem[]) || null,
      testsAndExams: (created.testsAndExams as unknown as TestOrExamItem[]) || null,
      studyTopics: (created.studyTopics as unknown as StudyTopicItem[]) || null,
      learningResources: (created.learningResources as unknown as LearningResourceItem[]) || null,
      currentUnderstanding: created.currentUnderstanding as unknown as UnderstandingLevel,
      academicStatus: created.academicStatus as unknown as AcademicStatus,
      notes: created.notes,
      completionRequirements: created.completionRequirements,
      projectId: created.projectId,
      project: created.project || null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * Updates an existing course.
   */
  public static async updateCourse(
    userId: string,
    courseId: string,
    input: {
      code?: string | null;
      title?: string;
      creditHours?: number | null;
      instructor?: string | null;
      assessmentDates?: AssessmentDateItem[] | null;
      assignments?: AssignmentItem[] | null;
      testsAndExams?: TestOrExamItem[] | null;
      studyTopics?: StudyTopicItem[] | null;
      learningResources?: LearningResourceItem[] | null;
      currentUnderstanding?: UnderstandingLevel;
      academicStatus?: AcademicStatus;
      notes?: string | null;
      completionRequirements?: string | null;
      projectId?: string | null;
    }
  ): Promise<AcademicCourseDto> {
    const existing = await prisma.academicCourse.findFirst({
      where: { id: courseId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Academic course not found.');
    }

    const updated = await prisma.academicCourse.update({
      where: { id: courseId },
      data: {
        ...(input.code !== undefined && { code: input.code?.trim() || null }),
        ...(input.title && { title: input.title.trim() }),
        ...(input.creditHours !== undefined && { creditHours: input.creditHours }),
        ...(input.instructor !== undefined && { instructor: input.instructor?.trim() || null }),
        ...(input.assessmentDates !== undefined && {
          assessmentDates: input.assessmentDates ? (input.assessmentDates as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.assignments !== undefined && {
          assignments: input.assignments ? (input.assignments as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.testsAndExams !== undefined && {
          testsAndExams: input.testsAndExams ? (input.testsAndExams as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.studyTopics !== undefined && {
          studyTopics: input.studyTopics ? (input.studyTopics as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.learningResources !== undefined && {
          learningResources: input.learningResources ? (input.learningResources as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        }),
        ...(input.currentUnderstanding && {
          currentUnderstanding: input.currentUnderstanding as unknown as import('@prisma/client').UnderstandingLevel,
        }),
        ...(input.academicStatus && {
          academicStatus: input.academicStatus as unknown as import('@prisma/client').AcademicStatus,
        }),
        ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
        ...(input.completionRequirements !== undefined && {
          completionRequirements: input.completionRequirements?.trim() || null,
        }),
        ...(input.projectId !== undefined && { projectId: input.projectId || null }),
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      semesterId: updated.semesterId,
      code: updated.code,
      title: updated.title,
      creditHours: updated.creditHours,
      instructor: updated.instructor,
      assessmentDates: (updated.assessmentDates as unknown as AssessmentDateItem[]) || null,
      assignments: (updated.assignments as unknown as AssignmentItem[]) || null,
      testsAndExams: (updated.testsAndExams as unknown as TestOrExamItem[]) || null,
      studyTopics: (updated.studyTopics as unknown as StudyTopicItem[]) || null,
      learningResources: (updated.learningResources as unknown as LearningResourceItem[]) || null,
      currentUnderstanding: updated.currentUnderstanding as unknown as UnderstandingLevel,
      academicStatus: updated.academicStatus as unknown as AcademicStatus,
      notes: updated.notes,
      completionRequirements: updated.completionRequirements,
      projectId: updated.projectId,
      project: updated.project || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Deletes a course.
   */
  public static async deleteCourse(userId: string, courseId: string): Promise<void> {
    const existing = await prisma.academicCourse.findFirst({
      where: { id: courseId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Academic course not found.');
    }

    await prisma.academicCourse.delete({
      where: { id: courseId },
    });
  }
}

