import { AIProvider, AIRequest, AIResponse } from './types';
import { AIError } from './error';
import { AIErrorHandler } from './error-handler';
import { RetryHandler } from '../retry';

/**
 * Abstract base class for AI providers
 * 
 * This class implements common functionality and provides a template for
 * provider-specific implementations. It follows the Template Method pattern
 * to define the structure of the algorithm while allowing subclasses to
 * override specific steps.
 * 
 * Features:
 * - Common validation logic
 * - Standardized error handling
 * - Automatic retry mechanism
 * - Support for both standard and streaming chat
 * - Consistent response formatting
 */
export abstract class BaseAIProvider implements AIProvider {
  protected abstract serviceName: string;
  protected apiKey: string;
  protected baseUrl?: string;

  /**
   * Creates a new AI provider instance
   * 
   * @param apiKey - The API key for the service
   * @param baseUrl - Optional custom API endpoint
   * @throws {AIError} If no API key is provided
   */
  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new AIError(`${this.getServiceName()} API key is required`);
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Gets the service name for error messages
   * @returns The provider service name
   */
  protected getServiceName(): string {
    return this.serviceName || 'AI Provider';
  }

  /**
   * Template method for chat implementation
   * This method defines the algorithm structure but delegates
   * specific steps to subclasses
   * 
   * @param request - The AI request parameters
   * @returns Promise with AI response
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    return AIErrorHandler.withErrorHandling(async () => {
      // Step 1: Validate the request
      this.validateRequest(request);

      // Step 2: Execute the request with retry capability
      return RetryHandler.withRetry(async () => {
        try {
          // Step 3: Choose between streaming and standard chat based on request
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
   * Must be implemented by subclasses
   * 
   * @param request - The AI request parameters 
   * @returns Promise with AI response
   */
  protected abstract standardChat(request: AIRequest): Promise<AIResponse>;

  /**
   * Provider-specific implementation for streaming chat
   * Default implementation throws error if not supported by the provider
   * 
   * @param request - The AI request parameters
   * @returns Promise with AI response
   * @throws {AIError} If streaming is not supported
   */
  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
    throw new AIError(`Streaming is not supported by ${this.getServiceName()}`);
  }

  /**
   * Validates the chat request parameters
   * 
   * @param request - The AI request to validate
   * @throws {AIError} If validation fails
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
   * Creates text embeddings from the provided text
   * Default implementation throws error if not supported by the provider
   * 
   * @param text - The text to create embeddings for
   * @returns Promise with embedding vector
   * @throws {AIError} If embeddings are not supported
   */
  async createEmbedding(text: string): Promise<number[]> {
    throw new AIError(`Embeddings are not supported by ${this.getServiceName()}`);
  }

  /**
   * Helper to format a response object to the standardized AIResponse format
   * 
   * @param id - Response ID
   * @param model - Model name
   * @param content - Response content
   * @param promptTokens - Number of tokens in the prompt
   * @param completionTokens - Number of tokens in the completion
   * @param totalTokens - Total number of tokens used
   * @returns Standardized AI response object
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