import MistralClient from '@mistralai/mistralai';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';

export class MistralProvider implements AIProvider {
  private client: MistralClient;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('Mistral API key is required');
    }

    try {
      this.client = new MistralClient(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize Mistral client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return ErrorHandler.handleAsync(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      try {
        const response = await this.client.chat({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
          stream: request.stream,
        });

        if (!response.choices[0].message.content) {
          throw new AIError('Empty response from Mistral');
        }

        return {
          id: response.id,
          model: response.model,
          message: {
            role: 'assistant',
            content: response.choices[0].message.content,
          },
          usage: {
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          },
        };
      } catch (error) {
        if (ErrorHandler.isAuthError(error)) {
          throw new AIError('Invalid or expired Mistral API key');
        }
        if (ErrorHandler.isRateLimitError(error)) {
          throw new AIError('Mistral rate limit exceeded. Please try again later.');
        }
        if (ErrorHandler.isNetworkError(error)) {
          throw new AIError('Network error while connecting to Mistral');
        }
        throw new AIError('Mistral request failed: ' + ErrorHandler.handle(error));
      }
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    return ErrorHandler.handleAsync(async () => {
      if (!text.trim()) {
        throw new AIError('Empty text provided for embedding');
      }

      try {
        const response = await this.client.embeddings({
          model: 'mistral-embed',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        throw new AIError('Mistral embedding creation failed: ' + ErrorHandler.handle(error));
      }
    });
  }
}