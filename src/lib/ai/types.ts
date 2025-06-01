import { z } from 'zod';

interface AIMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export interface AIResponse {
  id: string;
  model: string;
  message: AIMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  chat(request: AIRequest): Promise<AIResponse>;
  createEmbedding?(text: string): Promise<number[]>;
}

const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'groq',
  'mistral',
  'openai-compatible'
]);

const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: AIProviderSchema,
  maxTokens: z.number(),
  inputCostPer1k: z.number(),
  outputCostPer1k: z.number(),
  features: z.array(z.string()),
  contextWindow: z.number(),
  knowledgeCutoff: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
});

export type AIModel = z.infer<typeof AIModelSchema>;