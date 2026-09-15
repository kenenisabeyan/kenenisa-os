import { apiClient } from '../../lib/api-client.js';
import type {
  IntelligenceChatInput,
  IntelligenceChatOutput,
  ConversationDto,
  ConversationMessageDto,
  UserMemoryDto,
  CreateUserMemoryInput,
  MemoryCategory,
} from '@kenenisa-os/shared';

export async function sendChatMessage(input: IntelligenceChatInput): Promise<IntelligenceChatOutput> {
  return apiClient<IntelligenceChatOutput>('/api/v1/intelligence/chat', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function confirmActionProposal(proposalId: string, confirm: boolean): Promise<{ success: boolean; result: unknown }> {
  return apiClient<{ success: boolean; result: unknown }>('/api/v1/intelligence/actions/confirm', {
    method: 'POST',
    body: JSON.stringify({ proposalId, confirm }),
  });
}

export async function fetchConversations(): Promise<ConversationDto[]> {
  return apiClient<ConversationDto[]>('/api/v1/intelligence/conversations');
}

export async function fetchConversationMessages(id: string): Promise<ConversationMessageDto[]> {
  return apiClient<ConversationMessageDto[]>(`/api/v1/intelligence/conversations/${id}/messages`);
}

export async function deleteConversation(id: string): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>(`/api/v1/intelligence/conversations/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchUserMemories(category?: MemoryCategory, includeArchived = false): Promise<UserMemoryDto[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (includeArchived) params.append('includeArchived', 'true');
  const str = params.toString();
  return apiClient<UserMemoryDto[]>(`/api/v1/intelligence/memory${str ? `?${str}` : ''}`);
}

export async function createUserMemory(input: CreateUserMemoryInput): Promise<UserMemoryDto> {
  return apiClient<UserMemoryDto>('/api/v1/intelligence/memory', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function archiveUserMemory(id: string): Promise<UserMemoryDto> {
  return apiClient<UserMemoryDto>(`/api/v1/intelligence/memory/${id}/archive`, {
    method: 'POST',
  });
}
