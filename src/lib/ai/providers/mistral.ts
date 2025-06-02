import MistralClient from '@mistralai/mistralai';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class MistralProvider extends BaseAIProvider {
  protected serviceName = 'Mistral AI';
  private client: MistralClient;

  constructor(apiKey: string) {
    super(apiKey);

    try {
      this.client = new MistralClient(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize Mistral client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chat({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      stream: false,
    });

    if (!response.choices[0].message.content) {
      throw new AIError('Empty response from Mistral');
    }

    return this.formatAIResponse(
      response.id,
      response.model,
      response.choices[0].message.content,
      response.usage.promptTokens,
      response.usage.completionTokens,
      response.usage.totalTokens
    );
  }

  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.chatStream({
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });

    let content = '';
    let responseId = '';
    let modelName = request.model;
    
    for await (const chunk of response) {
      if (!responseId && chunk.id) {
        responseId = chunk.id;
      }
      if (!modelName && chunk.model) {
        modelName = chunk.model;
      }
      
      const text = chunk.choices[0]?.delta?.content || '';
      content += text;
      
      if (request.onToken) {
        request.onToken(text);
      }
    }

    return this.formatAIResponse(
      responseId || crypto.randomUUID(),
      modelName,
      content
    );
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new AIError('Empty text provided for embedding');
    }

    const response = await this.client.embeddings({
      model: 'mistral-embed',
      input: text,
    });
    return response.data[0].embedding;
  }
}