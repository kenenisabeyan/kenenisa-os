import { AIProvider, AIRequest, AIResponse } from './ai-provider.interface.js';

export class MockAIProvider implements AIProvider {
  readonly name = 'MockAIProvider';

  async generate(request: AIRequest): Promise<AIResponse> {
    await Promise.resolve();
    const lastMessage = request.messages[request.messages.length - 1]?.content.toLowerCase() || '';

    // Check for tool action proposal intent
    if (lastMessage.includes('create a task') || lastMessage.includes('add task')) {
      const match = lastMessage.match(/(?:create a task|add task)\s+(?:called|titled|to)?\s*"?([^".]+)"?/i);
      const title = match && match[1] ? match[1].trim() : 'New Task from Intelligence Assistant';

      return {
        content: `I can create the task "${title}" for you. Please confirm to proceed with task creation.`,
        toolCalls: [
          {
            id: `tool-${Date.now()}`,
            name: 'propose_create_task',
            arguments: {
              title,
              priority: 'P2',
              estimateMinutes: 60,
            },
          },
        ],
        facts: [`Task title: ${title}`],
        inferences: ['Creating this task will add it to your project backlog.'],
        recommendations: ['Confirm task creation to proceed.'],
        usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
      };
    }

    if (lastMessage.includes('time block') || lastMessage.includes('schedule')) {
      return {
        content: `I propose scheduling a 90-minute Deep Work time block starting tomorrow at 09:00 AM. Please confirm if you would like me to persist this time block.`,
        toolCalls: [
          {
            id: `tool-${Date.now()}`,
            name: 'propose_create_time_block',
            arguments: {
              title: 'Focus Execution Session',
              startAt: new Date(Date.now() + 86400000).toISOString(),
              endAt: new Date(Date.now() + 86400000 + 5400000).toISOString(),
            },
          },
        ],
        facts: ['Tomorrow 09:00 - 10:30 AM is open in your capacity.'],
        inferences: ['High focus time blocks improve daily completion rates.'],
        recommendations: ['Confirm the proposed time block.'],
        usage: { promptTokens: 40, completionTokens: 25, totalTokens: 65 },
      };
    }

    if (
      lastMessage.includes('what should i do') ||
      lastMessage.includes('next best action') ||
      lastMessage.includes('next action') ||
      lastMessage.includes('focus')
    ) {
      const nbaTitle = (request.context?.nextBestActionTitle as string) || 'Review daily priority tasks';
      return {
        content: `Based on your deterministic operating system data, your next best action is **${nbaTitle}**. This task is surfaced because it has high priority and zero unresolved blocking dependencies.`,
        facts: [
          `Current Next Best Action: ${nbaTitle}`,
          `Active Projects: ${(request.context?.activeProjectsCount as number) || 0}`,
          `Overdue Tasks: ${(request.context?.overdueTasksCount as number) || 0}`,
        ],
        inferences: [
          'Focusing on your single Next Best Action will unblock downstream project milestones.',
        ],
        recommendations: [
          'Complete the Next Best Action before starting lower priority backlog tasks.',
        ],
        usage: { promptTokens: 60, completionTokens: 40, totalTokens: 100 },
      };
    }

    // Default contextual response
    return {
      content: `I am the KENENISA OS Intelligence Core. I have processed your request based on your current operating state. How can I assist you with your planning, execution, learning, or opportunities today?`,
      facts: ['Operating context validated strictly for authenticated session.'],
      inferences: ['System functioning in factual deterministic intelligence mode.'],
      recommendations: ['Ask about your next best action, weekly analytics, or active opportunities.'],
      usage: { promptTokens: 30, completionTokens: 25, totalTokens: 55 },
    };
  }
}
