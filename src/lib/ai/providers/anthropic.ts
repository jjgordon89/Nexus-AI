import { Anthropic } from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';
import { AIErrorHandler } from '../error-handler';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('Anthropic API key is required');
    }

    try {
      this.client = new Anthropic({ apiKey });
    } catch (error) {
      throw new AIError('Failed to initialize Anthropic client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return AIErrorHandler.withErrorHandling(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      try {
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

        return {
          id: response.id,
          model: response.model,
          message: {
            role: 'assistant',
            content: response.content[0].text,
          },
          usage: {
            promptTokens: response.usage?.input_tokens || 0,
            completionTokens: response.usage?.output_tokens || 0,
            totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          },
        };
      } catch (error) {
        // Let AIErrorHandler handle the error categorization
        throw error;
      }
    });
  }
}