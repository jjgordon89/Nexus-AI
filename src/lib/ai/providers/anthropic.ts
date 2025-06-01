import { Anthropic } from '@anthropic-ai/sdk';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';

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
    return ErrorHandler.handleAsync(async () => {
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
        if (ErrorHandler.isAuthError(error)) {
          throw new AIError('Invalid or expired Anthropic API key');
        }
        if (ErrorHandler.isRateLimitError(error)) {
          throw new AIError('Anthropic rate limit exceeded. Please try again later.');
        }
        if (ErrorHandler.isNetworkError(error)) {
          throw new AIError('Network error while connecting to Anthropic');
        }
        throw new AIError('Anthropic request failed: ' + ErrorHandler.handle(error));
      }
    });
  }
}