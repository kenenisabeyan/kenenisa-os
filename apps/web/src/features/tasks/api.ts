import { apiClient } from '../../lib/api-client.js';
import {
  TaskDto,
  TaskDependencyDto,
  TaskQuery,
  TaskReorderItem,
  createTaskSchema,
  updateTaskSchema,
  createTaskDependencySchema,
} from '@kenenisa-os/shared';
import { z } from 'zod';

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type CreateTaskDependencyInput = z.input<typeof createTaskDependencySchema>;

export async function fetchTasks(query: TaskQuery = {}): Promise<TaskDto[]> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.pageSize) params.append('pageSize', String(query.pageSize));
  if (query.projectId) params.append('projectId', query.projectId);
  if (query.milestoneId) params.append('milestoneId', query.milestoneId);
  if (query.parentTaskId !== undefined && query.parentTaskId !== null) {
    params.append('parentTaskId', query.parentTaskId);
  }
  if (query.status) params.append('status', query.status);
  if (query.priority) params.append('priority', query.priority);
  if (query.search) params.append('search', query.search);
  if (query.overdue !== undefined) params.append('overdue', String(query.overdue));
  if (query.ready !== undefined) params.append('ready', String(query.ready));
  if (query.blocked !== undefined) params.append('blocked', String(query.blocked));
  if (query.completed !== undefined) params.append('completed', String(query.completed));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiClient<TaskDto[]>(`/api/v1/tasks${queryString}`);
}

export async function fetchTaskById(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}`);
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  return apiClient<TaskDto>('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function startTask(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}/start`, {
    method: 'POST',
  });
}

export async function blockTask(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}/block`, {
    method: 'POST',
  });
}

export async function completeTask(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}/complete`, {
    method: 'POST',
  });
}

export async function reopenTask(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}/reopen`, {
    method: 'POST',
  });
}

export async function cancelTask(id: string): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${id}/cancel`, {
    method: 'POST',
  });
}

export async function reorderTasks(items: TaskReorderItem[]): Promise<boolean> {
  await apiClient<{ success: boolean }>('/api/v1/tasks/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return true;
}

export async function createSubtask(
  parentTaskId: string,
  input: CreateTaskInput,
): Promise<TaskDto> {
  return apiClient<TaskDto>(`/api/v1/tasks/${parentTaskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function addTaskDependency(
  dependentTaskId: string,
  input: CreateTaskDependencyInput,
): Promise<TaskDependencyDto> {
  return apiClient<TaskDependencyDto>(`/api/v1/tasks/${dependentTaskId}/dependencies`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function removeTaskDependency(
  dependentTaskId: string,
  dependencyId: string,
): Promise<boolean> {
  await apiClient<{ success: boolean }>(
    `/api/v1/tasks/${dependentTaskId}/dependencies/${dependencyId}`,
    {
      method: 'DELETE',
    },
  );
  return true;
}
