import { AIProvider, AIRequest, AIResponse, AIToolCall } from './ai-provider.interface.js';
import { logger } from '../../../lib/logger.js';

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAIProvider';

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY (or AI_API_KEY) is not configured.');
    }

    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 20000;

    const messages = [
      {
        role: 'system',
        content: [
          request.systemInstruction ||
            'You are KENENISA OS Intelligence Core, an AI systems advisor for Kenenisa Beyan managing ASTU graduation, software engineering, and career development.',
          request.context ? `FACTUAL OPERATING SYSTEM CONTEXT:\n${JSON.stringify(request.context, null, 2)}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      },
      ...request.messages.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'tool' as const,
            tool_call_id: m.toolCallId || 'call_default',
            content: m.content,
          };
        }
        return {
          role: m.role,
          content: m.content,
        };
      }),
    ];

    const tools = request.availableTools && request.availableTools.length > 0
      ? request.availableTools.map((t) => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }))
      : undefined;

    const body: Record<string, any> = {
      model,
      messages,
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 1500,
    };

    if (tools) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        logger.error({ status: res.status, errText }, '[OpenAIProvider] API request failed');
        throw new Error(`OpenAI API error [${res.status}]: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as any;
      const choice = data.choices?.[0]?.message;
      const text = choice?.content || '';

      const toolCalls: AIToolCall[] = [];
      if (Array.isArray(choice?.tool_calls)) {
        for (const tc of choice.tool_calls) {
          try {
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: JSON.parse(tc.function.arguments || '{}'),
            });
          } catch {
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: {},
            });
          }
        }
      }

      return {
        content: text || (toolCalls.length > 0 ? `Invoking ${toolCalls.map((t) => t.name).join(', ')}...` : 'No response generated from provider.'),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        providerName: this.name,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`OpenAI API request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
