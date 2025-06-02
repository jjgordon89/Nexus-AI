import Groq from 'groq-sdk';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class GroqProvider extends BaseAIProvider {
  protected serviceName = 'Groq';
  private client: Groq;

  constructor(apiKey: string) {
    super(apiKey);

    try {
      this.client = new Groq({ apiKey });
    } catch (error) {
      throw new AIError('Failed to initialize Groq client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    const completion = await this.client.chat.completions.create({
      messages: request.messages,
      model: request.model,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: false,
    });

    if (!completion.choices[0].message.content) {
      throw new AIError('Empty response from Groq');
    }

    return this.formatAIResponse(
      completion.id,
      completion.model,
      completion.choices[0].message.content,
      completion.usage?.prompt_tokens || 0,
      completion.usage?.completion_tokens || 0,
      completion.usage?.total_tokens || 0
    );
  }

  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    const stream = await this.client.chat.completions.create({
      messages: request.messages,
      model: request.model,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true,
    });

    let content = '';
    let responseId = '';
    let modelName = request.model;
    
    for await (const chunk of stream) {
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
}