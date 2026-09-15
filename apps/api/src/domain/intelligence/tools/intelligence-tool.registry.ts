import { prisma } from '../../../lib/prisma.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (userId: string, args: Record<string, unknown>) => Promise<unknown>;
}

export class IntelligenceToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.registerReadTools();
    this.registerActionTools();
  }

  private registerReadTools() {
    this.tools.set('get_current_state', {
      name: 'get_current_state',
      description: 'Get high-level factual summary of current tasks, capacity, projects, and learning.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        const [tasks, projects, opportunities] = await Promise.all([
          prisma.task.count({ where: { userId, status: { in: ['READY', 'IN_PROGRESS'] } } }),
          prisma.project.count({ where: { userId, status: 'ACTIVE' } }),
          prisma.opportunity.count({ where: { userId, status: { in: ['APPLIED', 'INTERVIEW', 'OFFERED', 'ACTIVE'] } } }),
        ]);
        return { openTasks: tasks, activeProjects: projects, activeOpportunities: opportunities };
      },
    });

    this.tools.set('get_blocked_tasks', {
      name: 'get_blocked_tasks',
      description: 'Retrieve all tasks that are currently BLOCKED.',
      parameters: { type: 'object', properties: {} },
      execute: async (userId) => {
        return prisma.task.findMany({
          where: { userId, status: 'BLOCKED' },
          select: { id: true, title: true, priority: true, project: { select: { name: true } } },
        });
      },
    });
  }

  private registerActionTools() {
    this.tools.set('propose_create_task', {
      name: 'propose_create_task',
      description: 'Propose creating a new task. Requires user confirmation before execution.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title' },
          priority: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
          estimateMinutes: { type: 'number' },
        },
        required: ['title'],
      },
      execute: async (_userId, args) => {
        await Promise.resolve();
        const title = (args.title as string) || 'New Task';
        const priority = (args.priority as string) || 'P2';
        return {
          proposedAction: 'CREATE_TASK',
          summary: `Create task "${title}" with priority ${priority}`,
          args,
        };
      },
    });

    this.tools.set('propose_create_time_block', {
      name: 'propose_create_time_block',
      description: 'Propose scheduling a time block. Requires user confirmation before execution.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          startAt: { type: 'string' },
          endAt: { type: 'string' },
        },
        required: ['title', 'startAt', 'endAt'],
      },
      execute: async (_userId, args) => {
        await Promise.resolve();
        const title = (args.title as string) || 'Focus Execution Session';
        return {
          proposedAction: 'CREATE_TIME_BLOCK',
          summary: `Create time block "${title}"`,
          args,
        };
      },
    });
  }

  getAvailableTools() {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  async executeTool(name: string, userId: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(userId, args);
  }
}
