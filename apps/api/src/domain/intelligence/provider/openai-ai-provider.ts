import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse, AIToolCall } from './ai-provider.interface.js';
import { logger } from '../../../lib/logger.js';

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAIProvider';
  private client: OpenAI | null = null;
  private clientApiKey: string | null = null;
  private clientBaseUrl: string | null = null;

  private getClient(apiKey: string, baseURL?: string, timeoutMs = 25000): OpenAI {
    if (!this.client || this.clientApiKey !== apiKey || this.clientBaseUrl !== (baseURL || null)) {
      this.client = new OpenAI({
        apiKey,
        baseURL: baseURL || undefined,
        timeout: timeoutMs,
        maxRetries: 2,
      });
      this.clientApiKey = apiKey;
      this.clientBaseUrl = baseURL || null;
    }
    return this.client;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openai_api_key')) {
      throw new Error('OPENAI_API_KEY is not configured or contains placeholder value.');
    }

    const baseUrl = process.env.AI_BASE_URL || undefined;
    const model = request.modelOverride || process.env.AI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 25000;

    const client = this.getClient(apiKey, baseUrl, timeoutMs);

    // 1. Build messages payload
    const systemPrompt = [
      request.systemInstruction ||
        'You are KENENISA OS Intelligence Core, an advanced AI systems advisor for Kenenisa Beyan managing ASTU graduation, software engineering, and career operating workflows.',
      'OPERATING PRINCIPLES:\n' +
        '1. Ground every statement in verified application data. Do not hallucinate or invent progress.\n' +
        '2. Use available tools to fetch data across domains (projects, tasks, blockers, deadlines, learning, capacity, reviews).\n' +
        '3. If data is missing or empty, explicitly state what is missing.\n' +
        '4. Explain the rationale behind recommendations.',
      request.context ? `FACTUAL OPERATING SYSTEM CONTEXT:\n${JSON.stringify(request.context, null, 2)}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...request.messages.map((m): OpenAI.Chat.Completions.ChatCompletionMessageParam => {
        if (m.role === 'tool') {
          return {
            role: 'tool',
            tool_call_id: m.toolCallId || 'call_default',
            content: m.content,
          };
        }
        if (m.role === 'assistant') {
          if (m.toolCalls && m.toolCalls.length > 0) {
            return {
              role: 'assistant',
              content: m.content || null,
              tool_calls: m.toolCalls.map((tc) => ({
                id: tc.id,
                type: 'function',
                function: {
                  name: tc.name,
                  arguments: JSON.stringify(tc.arguments),
                },
              })),
            };
          }
          return {
            role: 'assistant',
            content: m.content,
          };
        }
        return {
          role: 'user',
          content: m.content,
        };
      }),
    ];

    // 2. Format tool definitions for OpenAI function calling
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined =
      request.availableTools && request.availableTools.length > 0
        ? request.availableTools.map((t) => ({
            type: 'function',
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          }))
        : undefined;

    try {
      logger.info({ model, messageCount: messages.length, toolCount: tools?.length || 0 }, '[OpenAIProvider] Sending ChatCompletion request');

      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 2000,
        tools,
        tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
      });

      const choice = completion.choices[0];
      const message = choice?.message;
      const text = message?.content || '';

      const toolCalls: AIToolCall[] = [];
      if (Array.isArray(message?.tool_calls)) {
        for (const tc of message.tool_calls) {
          if (tc.type === 'function') {
            let parsedArgs: Record<string, unknown> = {};
            try {
              parsedArgs = JSON.parse(tc.function.arguments || '{}');
            } catch {
              parsedArgs = {};
            }
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: parsedArgs,
            });
          }
        }
      }

      return {
        content: text || (toolCalls.length > 0 ? `Synthesizing real application context via ${toolCalls.map((t) => t.name).join(', ')}...` : ''),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        providerName: `OpenAI (${model})`,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      };
    } catch (err: unknown) {
      if (err instanceof OpenAI.APIError) {
        logger.error({ status: err.status, message: err.message, code: err.code }, '[OpenAIProvider] API request failed');
        throw new Error(`OpenAI API error [${err.status || 'unknown'}]: ${err.message}`);
      }
      logger.error({ err }, '[OpenAIProvider] Unexpected execution error');
      throw err;
    }
  }
}
