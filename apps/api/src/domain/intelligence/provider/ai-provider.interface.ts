export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIRequestMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: AIToolCall[];
}

export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AIRequest {
  systemInstruction?: string;
  messages: AIRequestMessage[];
  context?: Record<string, unknown>;
  availableTools?: AIToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  toolCalls?: AIToolCall[];
  facts?: string[];
  inferences?: string[];
  recommendations?: string[];
  providerName?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProvider {
  readonly name: string;
  generate(request: AIRequest): Promise<AIResponse>;
}
