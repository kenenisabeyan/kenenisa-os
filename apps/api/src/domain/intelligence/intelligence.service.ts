import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';
import {
  ConversationDto,
  ConversationMessageDto,
  IntelligenceChatInput,
  IntelligenceChatOutput,
  ActionProposalDto,
  ActionExecutionInput,
  CreateUserMemoryInput,
} from '@kenenisa-os/shared';
import { ContextService } from './context/context.service.js';
import { IntelligenceToolRegistry } from './tools/intelligence-tool.registry.js';
import { IntelligenceSafetyService } from './safety/intelligence-safety.service.js';
import { MemoryService } from './memory/memory.service.js';
import { AIProvider } from './provider/ai-provider.interface.js';
import { OpenAIProvider } from './provider/openai-ai-provider.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';

export class IntelligenceService {
  private contextService = new ContextService();
  private toolRegistry = new IntelligenceToolRegistry();
  private safetyService = new IntelligenceSafetyService();
  private memoryService = new MemoryService();
  private provider: AIProvider = new OpenAIProvider();

  // Active proposals stored temporarily in-memory for confirmation execution
  private pendingProposals = new Map<string, { userId: string; actionType: string; details: Record<string, unknown> }>();

  async chat(userId: string, input: IntelligenceChatInput): Promise<IntelligenceChatOutput> {
    const { cleanText } = this.safetyService.sanitizeInput(input.message);

    // 1. Resolve or create conversation
    let conversationId = input.conversationId;
    if (!conversationId) {
      const title = cleanText.length > 30 ? `${cleanText.substring(0, 30)}...` : cleanText;
      const conv = await prisma.conversation.create({
        data: { userId, title },
      });
      conversationId = conv.id;
    } else {
      const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conv) throw new NotFoundError(`Conversation not found: ${conversationId}`);
      if (conv.userId !== userId) throw new ForbiddenError('Access denied');
    }

    // 2. Persist user message
    await prisma.conversationMessage.create({
      data: {
        conversationId,
        userId,
        role: 'USER',
        content: cleanText,
      },
    });

    // 3. Fetch conversation history
    const history = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 4. Build deterministic context
    const context = await this.contextService.buildContext(userId);

    // 5. Generate AI response
    const requestMessages = history.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const response = await this.provider.generate({
      messages: requestMessages,
      context: context as unknown as Record<string, unknown>,
      availableTools: this.toolRegistry.getAvailableTools(),
    });

    // 6. Handle action proposals from tool calls
    let proposal: ActionProposalDto | null = null;
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolCall = response.toolCalls[0];
      const rawResult = await this.toolRegistry.executeTool(toolCall.name, userId, toolCall.arguments);
      const result = rawResult as { proposedAction?: ActionProposalDto['actionType']; args?: Record<string, unknown>; summary?: string } | null;

      if (result && result.proposedAction) {
        const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        this.pendingProposals.set(proposalId, {
          userId,
          actionType: result.proposedAction,
          details: result.args || toolCall.arguments,
        });

        proposal = {
          id: proposalId,
          actionType: result.proposedAction,
          summary: result.summary || `Proposed ${result.proposedAction}`,
          details: result.args || toolCall.arguments,
          requiresConfirmation: true,
          status: 'PROPOSED',
        };
      }
    }

    // 7. Persist assistant message
    const assistantMsg = await prisma.conversationMessage.create({
      data: {
        conversationId,
        userId,
        role: 'ASSISTANT',
        content: response.content,
        metadata: JSON.parse(
          JSON.stringify({
            proposal,
            facts: response.facts,
            inferences: response.inferences,
            recommendations: response.recommendations,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    // 8. Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId,
      message: {
        id: assistantMsg.id,
        conversationId: assistantMsg.conversationId,
        userId: assistantMsg.userId,
        role: 'ASSISTANT',
        content: assistantMsg.content,
        metadata: assistantMsg.metadata as Record<string, unknown> | null,
        createdAt: assistantMsg.createdAt.toISOString(),
      },
      contextSummary: {
        todayTasksCount: context.todayTasksCount,
        blockedTasksCount: context.blockedTasksCount,
        activeProjectsCount: context.activeProjectsCount,
        capacityMinutes: context.capacity.dailyCapacityMinutes,
        nextBestActionTitle: context.nextBestActionTitle,
      },
      proposal,
      facts: response.facts,
      inferences: response.inferences,
      recommendations: response.recommendations,
    };
  }

  async processChat(userId: string, input: IntelligenceChatInput): Promise<IntelligenceChatOutput> {
    return this.chat(userId, input);
  }

  async executeConfirmedAction(userId: string, input: ActionExecutionInput): Promise<{ success: boolean; result: unknown }> {
    const pending = this.pendingProposals.get(input.proposalId);
    if (!pending) throw new NotFoundError(`Action proposal not found or expired: ${input.proposalId}`);
    if (pending.userId !== userId) throw new ForbiddenError('Access denied');

    if (!input.confirm) {
      this.pendingProposals.delete(input.proposalId);
      return { success: false, result: 'Action proposal cancelled by user.' };
    }

    let result: unknown = null;

    if (pending.actionType === 'CREATE_TASK') {
      const title = (pending.details.title as string) || 'New AI Proposed Task';
      const defaultProject = await prisma.project.findFirst({ where: { userId, status: 'ACTIVE' } });
      if (!defaultProject) throw new BadRequestError('Cannot create task: No active project exists to assign task.');

      const priorityVal = (pending.details.priority as 'P0' | 'P1' | 'P2' | 'P3') || 'P2';
      const estimateVal = (pending.details.estimateMinutes as number) || 60;

      const task = await prisma.task.create({
        data: {
          userId,
          projectId: defaultProject.id,
          title,
          priority: priorityVal,
          estimateMinutes: estimateVal,
          status: 'READY',
        },
      });
      result = { taskId: task.id, title: task.title, status: task.status };
    } else if (pending.actionType === 'CREATE_TIME_BLOCK') {
      const title = (pending.details.title as string) || 'Focus Execution Session';
      const startAt = pending.details.startAt ? new Date(pending.details.startAt as string) : new Date();
      const endAt = pending.details.endAt ? new Date(pending.details.endAt as string) : new Date(Date.now() + 5400000);

      const tb = await prisma.timeBlock.create({
        data: {
          userId,
          title,
          startAt,
          endAt,
          status: 'PLANNED',
        },
      });
      result = { timeBlockId: tb.id, title: tb.title, startAt: tb.startAt.toISOString() };
    } else if (pending.actionType === 'CREATE_MEMORY') {
      const key = (pending.details.key as string) || 'Preference';
      const value = (pending.details.value as string) || 'User preference recorded';

      const mem = await this.memoryService.createUserMemory(userId, { key, value });
      result = mem;
    }

    this.pendingProposals.delete(input.proposalId);
    return { success: true, result };
  }

  async confirmActionProposal(userId: string, input: ActionExecutionInput): Promise<{ success: boolean; result: unknown }> {
    return this.executeConfirmedAction(userId, input);
  }

  async listConversations(userId: string): Promise<ConversationDto[]> {
    const convs = await prisma.conversation.findMany({
      where: { userId, archivedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return convs.map((c) => ({
      id: c.id,
      userId: c.userId,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      archivedAt: c.archivedAt ? c.archivedAt.toISOString() : null,
      _count: { messages: c._count.messages },
    }));
  }

  async getConversationMessages(userId: string, conversationId: string): Promise<ConversationMessageDto[]> {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundError(`Conversation not found: ${conversationId}`);
    if (conv.userId !== userId) throw new ForbiddenError('Access denied');

    const msgs = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      userId: m.userId,
      role: m.role as 'USER' | 'ASSISTANT' | 'SYSTEM',
      content: m.content,
      metadata: m.metadata as Record<string, unknown> | null,
      createdAt: m.createdAt.toISOString(),
    }));
  }

  async deleteConversation(userId: string, conversationId: string): Promise<{ success: boolean }> {
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) throw new NotFoundError(`Conversation not found: ${conversationId}`);
    if (conv.userId !== userId) throw new ForbiddenError('Access denied');

    await prisma.conversation.delete({ where: { id: conversationId } });
    return { success: true };
  }

  async listUserMemories(userId: string) {
    return this.memoryService.listUserMemories(userId);
  }

  async createUserMemory(userId: string, input: CreateUserMemoryInput) {
    return this.memoryService.createUserMemory(userId, input);
  }

  async archiveUserMemory(userId: string, id: string) {
    return this.memoryService.archiveUserMemory(id, userId);
  }
}
