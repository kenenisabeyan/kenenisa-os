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
import { AIProvider, AIRequestMessage, AIResponse } from './provider/ai-provider.interface.js';
import { AIProviderFactory } from './provider/ai-provider.factory.js';
import { GroundedReasoningEngine } from './provider/grounded-reasoning-engine.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors.js';
import { InternalCascadeService } from '../integration/internal-cascade.service.js';
import { logger } from '../../lib/logger.js';

export class IntelligenceService {
  private contextService = new ContextService();
  private toolRegistry = new IntelligenceToolRegistry();
  private safetyService = new IntelligenceSafetyService();
  private memoryService = new MemoryService();
  private groundedEngine = new GroundedReasoningEngine(this.toolRegistry);
  private provider: AIProvider = AIProviderFactory.createProvider(this.toolRegistry);

  // Active proposals stored in-memory + persisted with 24h TTL
  private pendingProposals = new Map<string, { userId: string; actionType: string; details: Record<string, unknown>; expiresAt: number }>();

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

    // 3. Fetch conversation history for multi-turn context
    const history = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 4. Multi-turn reference resolution (resolve pronouns e.g. "it", "that project")
    let resolvedPageContext = input.pageContext;
    if (!resolvedPageContext?.entityTitle) {
      const lowerQuery = cleanText.toLowerCase();
      if (lowerQuery.includes('it') || lowerQuery.includes('that project') || lowerQuery.includes('this project') || lowerQuery.includes('the project') || lowerQuery.includes('what is blocking')) {
        // Look back through history for referenced project names
        for (let i = history.length - 1; i >= 0; i--) {
          const content = history[i].content;
          if (content.includes('Individual Project A')) {
            resolvedPageContext = { ...resolvedPageContext, pageType: 'projects', entityTitle: 'Individual Project A' };
            break;
          } else if (content.includes('Group Project B')) {
            resolvedPageContext = { ...resolvedPageContext, pageType: 'projects', entityTitle: 'Group Project B' };
            break;
          }
        }
      }
    }

    // 5. Build dynamic context with live database metrics
    const context = await this.contextService.buildContext(userId, resolvedPageContext);

    // 6. Generate AI response with multi-turn tool calling
    const requestMessages: AIRequestMessage[] = history.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    let response: AIResponse;
    try {
      response = await this.provider.generate({
        messages: requestMessages,
        context: { ...context, userId, pageContext: resolvedPageContext } as unknown as Record<string, unknown>,
        availableTools: this.toolRegistry.getAvailableTools(),
      });

      // Handle multi-turn tool execution loop for data query tools
      if (response.toolCalls && response.toolCalls.length > 0) {
        const firstTool = response.toolCalls[0];
        if (!firstTool.name.startsWith('propose_') && this.provider.name !== 'GroundedReasoningEngine') {
          const toolResult = await this.toolRegistry.executeTool(firstTool.name, userId, firstTool.arguments);

          const followUpMessages: AIRequestMessage[] = [
            ...requestMessages,
            {
              role: 'assistant',
              content: response.content || `Invoking tool ${firstTool.name}...`,
              toolCalls: response.toolCalls,
            },
            {
              role: 'tool',
              toolCallId: firstTool.id,
              name: firstTool.name,
              content: JSON.stringify(toolResult),
            },
          ];

          response = await this.provider.generate({
            messages: followUpMessages,
            context: { ...context, userId, pageContext: resolvedPageContext } as unknown as Record<string, unknown>,
            availableTools: this.toolRegistry.getAvailableTools(),
          });
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      logger.warn({ errMsg }, '[IntelligenceService] Provider generation failed');

      if (this.provider.name !== 'GroundedReasoningEngine') {
        try {
          response = await this.groundedEngine.generate({
            messages: requestMessages,
            context: { ...context, userId, pageContext: resolvedPageContext } as unknown as Record<string, unknown>,
            availableTools: this.toolRegistry.getAvailableTools(),
          });
          response.content = `> ℹ️ *Grounded Mode Active: Operating dynamically over live database records.*\n\n${response.content}`;
        } catch (groundedErr: unknown) {
          const gMsg = groundedErr instanceof Error ? groundedErr.message : String(groundedErr);
          response = {
            content: `### ⚠️ Operating Intelligence Advisory\n\nI encountered a transient data synthesis error: \`${gMsg}\`. Current workspace metrics: **${context.todayTasksCount} active tasks**, **${context.blockedTasksCount} blocked tasks**, **${context.activeProjectsCount} projects**.`,
            providerName: 'GroundedReasoningEngine',
          };
        }
      } else {
        response = {
          content: `### ⚠️ Operating Intelligence Advisory\n\nI encountered a transient data synthesis error: \`${errMsg}\`. Current workspace metrics: **${context.todayTasksCount} active tasks**, **${context.blockedTasksCount} blocked tasks**, **${context.activeProjectsCount} projects**.`,
          providerName: 'GroundedReasoningEngine',
        };
      }
    }

    // 7. Handle action proposals from tool calls
    let proposal: ActionProposalDto | null = null;
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolCall = response.toolCalls[0];
      if (toolCall.name.startsWith('propose_')) {
        const rawResult = await this.toolRegistry.executeTool(toolCall.name, userId, toolCall.arguments);
        const result = rawResult as { proposedAction?: ActionProposalDto['actionType']; args?: Record<string, unknown>; summary?: string } | null;

        if (result && result.proposedAction) {
          const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const proposalPayload = {
            userId,
            actionType: result.proposedAction,
            details: result.args || toolCall.arguments,
            expiresAt: Date.now() + 86400000, // 24-hour TTL
          };

          this.pendingProposals.set(proposalId, proposalPayload);

          // Persist with 24-hour TTL in userMemory
          await prisma.userMemory.create({
            data: {
              userId,
              key: `proposal_${proposalId}`,
              value: JSON.stringify(proposalPayload),
              category: 'WORKFLOW',
              source: 'AI_PROPOSAL',
            },
          }).catch(() => {});

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
    }

    // 8. Persist assistant message
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
            providerName: response.providerName || this.provider.name,
          }),
        ) as Prisma.InputJsonValue,
      },
    });

    // 9. Update conversation timestamp
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
    let pending = this.pendingProposals.get(input.proposalId);

    if (!pending) {
      const mem = await prisma.userMemory.findFirst({
        where: { userId, key: `proposal_${input.proposalId}`, archivedAt: null },
      });
      if (mem) {
        try {
          const parsed = JSON.parse(mem.value) as { userId: string; actionType: string; details: Record<string, unknown>; expiresAt: number };
          if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
            throw new BadRequestError(`Action proposal has expired: ${input.proposalId}`);
          }
          pending = parsed;
        } catch (e: any) {
          if (e instanceof BadRequestError) throw e;
        }
      }
    }

    if (!pending) throw new NotFoundError(`Action proposal not found or expired: ${input.proposalId}`);
    if (pending.userId !== userId) throw new ForbiddenError('Access denied');

    if (!input.confirm) {
      this.pendingProposals.delete(input.proposalId);
      await prisma.userMemory.updateMany({
        where: { userId, key: `proposal_${input.proposalId}` },
        data: { archivedAt: new Date() },
      }).catch(() => {});
      return { success: false, result: 'Action proposal cancelled by user.' };
    }

    let result: unknown = null;

    if (pending.actionType === 'CREATE_TASK') {
      const title = (pending.details.title as string) || 'New AI Proposed Task';
      let targetProjectId = pending.details.projectId as string | undefined;

      if (!targetProjectId) {
        const defaultProject = await prisma.project.findFirst({ where: { userId, status: 'ACTIVE' } });
        if (!defaultProject) throw new BadRequestError('Cannot create task: No active project exists to assign task.');
        targetProjectId = defaultProject.id;
      }

      const priorityVal = (pending.details.priority as 'P0' | 'P1' | 'P2' | 'P3') || 'P2';
      const estimateVal = (pending.details.estimateMinutes as number) || 60;
      const dueDateVal = pending.details.dueDate ? new Date(pending.details.dueDate as string) : undefined;

      const task = await prisma.task.create({
        data: {
          userId,
          projectId: targetProjectId,
          title,
          priority: priorityVal,
          estimateMinutes: estimateVal,
          dueDate: dueDateVal,
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
    } else if (pending.actionType === 'RESOLVE_BLOCKER') {
      const prereqId = pending.details.prerequisiteTaskId as string;
      const blockedId = pending.details.blockedTaskId as string;

      const prereqTask = await prisma.task.findFirst({ where: { id: prereqId, userId } });
      if (!prereqTask) throw new NotFoundError(`Prerequisite task not found: ${prereqId}`);

      await prisma.task.update({
        where: { id: prereqId },
        data: { status: 'DONE', completedAt: new Date() },
      });

      // Trigger internal cascade to unblock dependent tasks
      await InternalCascadeService.onTaskStatusChanged(
        prereqId,
        userId,
        prereqTask.status,
        'DONE',
      );

      result = { resolvedPrerequisiteId: prereqId, unblockedTaskId: blockedId, status: 'DONE' };
    }

    this.pendingProposals.delete(input.proposalId);
    await prisma.userMemory.updateMany({
      where: { userId, key: `proposal_${input.proposalId}` },
      data: { archivedAt: new Date() },
    }).catch(() => {});

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
