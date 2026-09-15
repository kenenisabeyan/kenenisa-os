import { describe, it, expect, vi } from 'vitest';
import {
  sendChatMessage,
  confirmActionProposal,
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  fetchUserMemories,
  createUserMemory,
  archiveUserMemory,
} from '../intelligence/api.js';

vi.mock('../../lib/api-client.js', () => ({
  apiClient: vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes('/intelligence/chat') && init?.method === 'POST') {
      return Promise.resolve({
        conversationId: 'conv-123',
        message: {
          id: 'msg-456',
          conversationId: 'conv-123',
          userId: 'user-1',
          role: 'ASSISTANT',
          content: 'Here is your next best action...',
          createdAt: new Date().toISOString(),
        },
        proposal: null,
        contextSummary: {
          todayTasksCount: 3,
          blockedTasksCount: 0,
          activeProjectsCount: 2,
          capacityMinutes: 240,
          nextBestActionTitle: 'Finish Step 12',
        },
      });
    }

    if (url.includes('/intelligence/actions/confirm') && init?.method === 'POST') {
      return Promise.resolve({
        success: true,
        result: 'Action confirmed & executed successfully',
      });
    }

    if (url.includes('/intelligence/conversations/conv-123/messages')) {
      return Promise.resolve([
        {
          id: 'msg-1',
          conversationId: 'conv-123',
          userId: 'user-1',
          role: 'USER',
          content: 'Hello',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          conversationId: 'conv-123',
          userId: 'user-1',
          role: 'ASSISTANT',
          content: 'Hello! How can I assist you?',
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    if (url.includes('/intelligence/conversations') && init?.method === 'DELETE') {
      return Promise.resolve({ success: true });
    }

    if (url.includes('/intelligence/conversations') && (!init || init.method === 'GET')) {
      return Promise.resolve([
        {
          id: 'conv-123',
          userId: 'user-1',
          title: 'Planning & Intelligence Chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }

    if (url.includes('/intelligence/memory/mem-1/archive') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'mem-1',
        archivedAt: new Date().toISOString(),
      });
    }

    if (url.includes('/intelligence/memory') && init?.method === 'POST') {
      return Promise.resolve({
        id: 'mem-2',
        userId: 'user-1',
        category: 'WORKFLOW',
        key: 'preferred_mode',
        value: 'Deep Work Focus',
        archivedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (url.includes('/intelligence/memory') && (!init || init.method === 'GET')) {
      return Promise.resolve([
        {
          id: 'mem-1',
          userId: 'user-1',
          category: 'PREFERENCE',
          key: 'deep_work_hours',
          value: '9 AM - 12 PM',
          archivedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }

    return Promise.resolve({});
  }),
}));

describe('Frontend Intelligence API Client Suite', () => {
  it('sends chat message and receives intelligence response', async () => {
    const response = await sendChatMessage({ message: 'What should I work on?' });

    expect(response.conversationId).toBe('conv-123');
    expect(response.message.role).toBe('ASSISTANT');
    expect(response.contextSummary?.nextBestActionTitle).toBe('Finish Step 12');
  });

  it('confirms action proposal', async () => {
    const response = await confirmActionProposal('action-123', true);

    expect(response.success).toBe(true);
    expect(response.result).toContain('confirmed & executed');
  });

  it('fetches conversations list and messages', async () => {
    const list = await fetchConversations();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('conv-123');

    const messages = await fetchConversationMessages('conv-123');
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('USER');
    expect(messages[1].role).toBe('ASSISTANT');
  });

  it('deletes conversation', async () => {
    const res = await deleteConversation('conv-123');
    expect(res.success).toBe(true);
  });

  it('manages user memory (fetch, create, archive)', async () => {
    const memories = await fetchUserMemories();
    expect(memories).toHaveLength(1);
    expect(memories[0].key).toBe('deep_work_hours');

    const created = await createUserMemory({
      category: 'WORKFLOW',
      key: 'preferred_mode',
      value: 'Deep Work Focus',
    });
    expect(created.id).toBe('mem-2');

    const archived = await archiveUserMemory('mem-1');
    expect(archived.archivedAt).toBeDefined();
  });
});
