import { AIProvider, AIRequest, AIResponse } from './types';
import { AIError } from './error';
import { AIErrorHandler } from './error-handler';
import { RetryHandler } from '../retry';

/**
 * Base class for AI providers that implements common functionality
 * and provides a template for provider-specific implementations
 */
export abstract class BaseAIProvider implements AIProvider {
  protected abstract serviceName: string;
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new AIError(`${this.getServiceName()} API key is required`);
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Get the service name for error messages
   */
  protected getServiceName(): string {
    return this.serviceName || 'AI Provider';
  }

  /**
   * Template method for chat implementation
   * @param request The AI request parameters
   * @returns Promise with AI response
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    return AIErrorHandler.withErrorHandling(async () => {
      this.validateRequest(request);

      return RetryHandler.withRetry(async () => {
        try {
          const response = request.stream
            ? await this.streamingChat(request)
            : await this.standardChat(request);
          
          return response;
        } catch (error) {
          // Let AIErrorHandler handle the error categorization
          throw error;
        }
      });
    });
  }

  /**
   * Provider-specific implementation for standard (non-streaming) chat
   */
  protected abstract standardChat(request: AIRequest): Promise<AIResponse>;

  /**
   * Provider-specific implementation for streaming chat
   * Default implementation throws error if not supported
   */
  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    throw new AIError(`Streaming is not supported by ${this.getServiceName()}`);
  }

  /**
   * Validate the chat request parameters
   */
  protected validateRequest(request: AIRequest): void {
    if (!request.messages.length) {
      throw new AIError('No messages provided');
    }

    if (!request.model) {
      throw new AIError('Model must be specified');
    }
  }

  /**
   * Create text embeddings from the provided text
   * Default implementation throws error if not supported
   */
  async createEmbedding(text: string): Promise<number[]> {
    throw new AIError(`Embeddings are not supported by ${this.getServiceName()}`);
  }

  /**
   * Helper to format a response object to the standardized AIResponse format
   */
  protected formatAIResponse(
    id: string,
    model: string,
    content: string,
    promptTokens: number = 0,
    completionTokens: number = 0,
    totalTokens: number = 0
  ): AIResponse {
    return {
      id,
      model,
      message: {
        role: 'assistant',
        content,
      },
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: totalTokens || (promptTokens + completionTokens),
      },
    };
  }
}