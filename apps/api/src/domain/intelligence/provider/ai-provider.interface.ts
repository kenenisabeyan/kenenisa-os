export interface AIRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIRequest {
  systemInstruction?: string;
  messages: AIRequestMessage[];
  context?: Record<string, unknown>;
  availableTools?: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  toolCalls?: AIToolCall[];
  facts?: string[];
  inferences?: string[];
  recommendations?: string[];
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
