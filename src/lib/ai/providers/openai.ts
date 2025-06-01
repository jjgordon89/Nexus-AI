import OpenAI from 'openai';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';
import { RetryHandler } from '../../retry';
import { StreamingHandler } from '../../streaming-handler';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new AIError('OpenAI API key is required');
    }

    try {
      this.client = new OpenAI({ 
        apiKey,
        baseURL: baseUrl,
      });
    } catch (error) {
      throw new AIError('Failed to initialize OpenAI client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return ErrorHandler.handleAsync(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      return RetryHandler.withRetry(async () => {
        try {
          if (request.stream) {
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

            return {
              id: crypto.randomUUID(),
              model: request.model,
              message: {
                role: 'assistant',
                content,
              },
              usage: {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
              },
            };
          }

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

          return {
            id: response.id,
            model: response.model,
            message: {
              role: 'assistant',
              content: response.choices[0].message.content,
            },
            usage: {
              promptTokens: response.usage?.prompt_tokens || 0,
              completionTokens: response.usage?.completion_tokens || 0,
              totalTokens: response.usage?.total_tokens || 0,
            },
          };
        } catch (error) {
          if (ErrorHandler.isAuthError(error)) {
            throw new AIError('Invalid or expired OpenAI API key');
          }
          if (ErrorHandler.isRateLimitError(error)) {
            throw new AIError('OpenAI rate limit exceeded. Please try again later.');
          }
          if (ErrorHandler.isNetworkError(error)) {
            throw new AIError('Network error while connecting to OpenAI');
          }
          throw new AIError('OpenAI request failed: ' + ErrorHandler.handle(error));
        }
      });
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    return ErrorHandler.handleAsync(async () => {
      if (!text.trim()) {
        throw new AIError('Empty text provided for embedding');
      }

      return RetryHandler.withRetry(async () => {
        try {
          const response = await this.client.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
          });
          return response.data[0].embedding;
        } catch (error) {
          throw new AIError('OpenAI embedding creation failed: ' + ErrorHandler.handle(error));
        }
      });
    });
  }
}