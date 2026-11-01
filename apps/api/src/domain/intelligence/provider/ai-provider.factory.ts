import { AIProvider } from './ai-provider.interface.js';
import { OpenAIProvider } from './openai-ai-provider.js';
import { GeminiProvider } from './gemini-ai-provider.js';
import { GroundedReasoningEngine } from './grounded-reasoning-engine.js';
import { IntelligenceToolRegistry } from '../tools/intelligence-tool.registry.js';
import { logger } from '../../../lib/logger.js';

export class AIProviderFactory {
  public static createProvider(toolRegistry?: IntelligenceToolRegistry): AIProvider {
    const configuredProvider = (process.env.AI_PROVIDER || '').toLowerCase();
    const model = (process.env.AI_MODEL || '').toLowerCase();
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    // 1. Explicitly configured Gemini or Gemini model key
    if (configuredProvider === 'gemini' || model.startsWith('gemini') || process.env.GEMINI_API_KEY) {
      if (apiKey || process.env.GEMINI_API_KEY) {
        logger.info('[AIProviderFactory] Selected GeminiProvider');
        return new GeminiProvider();
      }
    }

    // 2. Explicitly configured OpenAI or standard LLM key
    if (configuredProvider === 'openai' || process.env.OPENAI_API_KEY || (apiKey && !apiKey.includes('your_openai_api_key'))) {
      logger.info('[AIProviderFactory] Selected OpenAIProvider');
      return new OpenAIProvider();
    }

    // 3. Grounded Dynamic Data Engine (Live PostgreSQL synthesis with Zero Canned Strings)
    logger.info('[AIProviderFactory] Selected GroundedReasoningEngine (Live Database Synthesis)');
    return new GroundedReasoningEngine(toolRegistry);
  }
}

