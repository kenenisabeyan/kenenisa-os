import { AIProvider, AIRequest, AIResponse, AIToolCall } from './ai-provider.interface.js';
import { logger } from '../../../lib/logger.js';

export class GeminiProvider implements AIProvider {
  readonly name = 'GeminiProvider';

  async generate(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY (or AI_API_KEY) is not configured.');
    }

    const rawModel = process.env.AI_MODEL || 'gemini-1.5-flash';
    const model = rawModel.startsWith('gemini') ? rawModel : 'gemini-1.5-flash';
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 20000;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Format messages for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; functionResponse?: any }> }> = [];

    // System instruction
    const systemText = [
      request.systemInstruction ||
        'You are KENENISA OS Intelligence Core, an AI systems advisor for Kenenisa Beyan managing ASTU graduation, software engineering, and career development.',
      request.context ? `LIVE OPERATING CONTEXT:\n${JSON.stringify(request.context, null, 2)}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    for (const msg of request.messages) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] });
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content }] });
      } else if (msg.role === 'tool') {
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: msg.name || 'tool_result',
                response: { result: msg.content },
              },
            },
          ],
        });
      }
    }

    // Ensure at least one user content exists
    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Provide an executive summary of current operating state.' }] });
    }

    // Format tool declarations
    const tools = request.availableTools && request.availableTools.length > 0
      ? [
          {
            functionDeclarations: request.availableTools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            })),
          },
        ]
      : undefined;

    const body: Record<string, any> = {
      contents,
      systemInstruction: { parts: [{ text: systemText }] },
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 1500,
      },
    };

    if (tools) {
      body.tools = tools;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errText = await res.text();
        logger.error({ status: res.status, errText }, '[GeminiProvider] API request failed');
        throw new Error(`Gemini API error [${res.status}]: ${errText.slice(0, 200)}`);
      }

      const data = (await res.json()) as any;
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      let content = '';
      const toolCalls: AIToolCall[] = [];

      for (const part of parts) {
        if (part.text) {
          content += part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: part.functionCall.name,
            arguments: part.functionCall.args || {},
          });
        }
      }

      return {
        content: content || (toolCalls.length > 0 ? `Invoking ${toolCalls.map((t) => t.name).join(', ')}...` : 'No response content returned.'),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        providerName: this.name,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount,
          completionTokens: data.usageMetadata?.candidatesTokenCount,
          totalTokens: data.usageMetadata?.totalTokenCount,
        },
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Gemini API request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}

