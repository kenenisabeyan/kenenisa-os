import { AIProvider, AIRequest, AIResponse } from './ai-provider.interface.js';
import { MockAIProvider } from './mock-ai-provider.js';

export class OpenAIProvider implements AIProvider {
  readonly name = 'OpenAIProvider';
  private fallbackProvider = new MockAIProvider();

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      // Fallback seamlessly if no API key is provided
      return this.fallbackProvider.generate(request);
    }

    const baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 15000;

    const messages = [
      {
        role: 'system',
        content: request.systemInstruction || 'You are KENENISA OS Intelligence Core, an AI advisor for personal engineering & career execution.',
      },
      ...request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    if (request.context) {
      messages.push({
        role: 'system',
        content: `FACTUAL OPERATING SYSTEM CONTEXT:\n${JSON.stringify(request.context, null, 2)}`,
      });
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: request.temperature ?? 0.3,
          max_tokens: request.maxTokens ?? 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        console.warn(`[OpenAIProvider] HTTP ${res.status} error, using fallback provider`);
        return this.fallbackProvider.generate(request);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      };
      const choice = data.choices?.[0]?.message;
      const text = choice?.content || 'No response generated from provider.';

      return {
        content: text,
        facts: ['Generated via LLM API with factual Operating System context.'],
        inferences: ['AI response tailored to active user context.'],
        recommendations: ['Verify recommendations against deterministic Next Best Action.'],
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      };
    } catch (err: unknown) {
      console.warn('[OpenAIProvider] Failed or timed out, falling back to MockAIProvider:', err instanceof Error ? err.message : err);
      return this.fallbackProvider.generate(request);
    }
  }
}
