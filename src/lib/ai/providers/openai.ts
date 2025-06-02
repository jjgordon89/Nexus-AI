import OpenAI from 'openai';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';
import { StreamingHandler } from '../../streaming-handler';

export class OpenAIProvider extends BaseAIProvider {
  protected serviceName = 'OpenAI';
  private client: OpenAI;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);

    try {
      this.client = new OpenAI({ 
        apiKey,
        baseURL: baseUrl,
      });
    } catch (error) {
      throw new AIError('Failed to initialize OpenAI client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: false,
    });

    if (!response.choices[0].message.content) {
      throw new AIError('Empty response from OpenAI');
    }

    return this.formatAIResponse(
      response.id,
      response.model,
      response.choices[0].message.content,
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      response.usage?.total_tokens || 0
    );
  }

  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat.completions.create({
      ...request,
      model: request.model,
      messages: request.messages,
      stream: true,
    });

    let content = '';
    for await (const chunk of response) {
      const token = chunk.choices[0]?.delta?.content || '';
      content += token;
      if (request.onToken) {
        request.onToken(token);
      }
    }

    return this.formatAIResponse(
      crypto.randomUUID(),
      request.model,
      content
    );
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new AIError('Empty text provided for embedding');
    }

    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }
}