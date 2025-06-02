import { Anthropic } from '@anthropic-ai/sdk';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class AnthropicProvider extends BaseAIProvider {
  protected serviceName = 'Anthropic';
  private client: Anthropic;

  constructor(apiKey: string) {
    super(apiKey);

    try {
      this.client = new Anthropic({ apiKey });
    } catch (error) {
      throw new AIError('Failed to initialize Anthropic client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: request.model,
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    });

    if (!response.content[0].text) {
      throw new AIError('Empty response from Anthropic');
    }

    return this.formatAIResponse(
      response.id,
      response.model,
      response.content[0].text,
      response.usage?.input_tokens || 0,
      response.usage?.output_tokens || 0
    );
  }

  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model: request.model,
      messages: request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
    });

    let content = '';
    for await (const chunk of response) {
      if (chunk.type === 'content_block_delta' && chunk.delta.text) {
        content += chunk.delta.text;
        if (request.onToken) {
          request.onToken(chunk.delta.text);
        }
      }
    }

    return this.formatAIResponse(
      crypto.randomUUID(),
      request.model,
      content
    );
  }
}