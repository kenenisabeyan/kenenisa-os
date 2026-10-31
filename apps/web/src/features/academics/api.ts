import { apiClient } from '../../lib/api-client.js';
import type {
  AcademicSemesterDto,
  AcademicCourseDto,
  CreateAcademicCourseInput,
  UpdateAcademicCourseInput,
} from '@kenenisa-os/shared';

export async function fetchSemesters(): Promise<AcademicSemesterDto[]> {
  const res = await apiClient<{ semesters: AcademicSemesterDto[] }>('/api/v1/academics/semesters');
  return res.semesters;
}

export async function fetchCourses(semesterId?: string): Promise<AcademicCourseDto[]> {
  const query = semesterId ? `?semesterId=${encodeURIComponent(semesterId)}` : '';
  const res = await apiClient<{ courses: AcademicCourseDto[] }>(`/api/v1/academics/courses${query}`);
  return res.courses;
}

export async function fetchCourseById(id: string): Promise<AcademicCourseDto> {
  const res = await apiClient<{ course: AcademicCourseDto }>(`/api/v1/academics/courses/${id}`);
  return res.course;
}

export async function createCourse(data: CreateAcademicCourseInput): Promise<AcademicCourseDto> {
  const res = await apiClient<{ course: AcademicCourseDto }>('/api/v1/academics/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.course;
}

export async function updateCourse(id: string, data: UpdateAcademicCourseInput): Promise<AcademicCourseDto> {
  const res = await apiClient<{ course: AcademicCourseDto }>(`/api/v1/academics/courses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return res.course;
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient(`/api/v1/academics/courses/${id}`, {
    method: 'DELETE',
  });
}

