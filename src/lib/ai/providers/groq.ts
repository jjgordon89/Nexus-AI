import Groq from 'groq-sdk';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';

export class GroqProvider implements AIProvider {
  private client: Groq;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('Groq API key is required');
    }

    try {
      this.client = new Groq({ apiKey });
    } catch (error) {
      throw new AIError('Failed to initialize Groq client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return ErrorHandler.handleAsync(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      try {
        const completion = await this.client.chat.completions.create({
          messages: request.messages,
          model: request.model,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: request.stream,
        });

        if (!completion.choices[0].message.content) {
          throw new AIError('Empty response from Groq');
        }

        return {
          id: completion.id,
          model: completion.model,
          message: {
            role: 'assistant',
            content: completion.choices[0].message.content,
          },
          usage: {
            promptTokens: completion.usage?.prompt_tokens || 0,
            completionTokens: completion.usage?.completion_tokens || 0,
            totalTokens: completion.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        if (ErrorHandler.isAuthError(error)) {
          throw new AIError('Invalid or expired Groq API key');
        }
        if (ErrorHandler.isRateLimitError(error)) {
          throw new AIError('Groq rate limit exceeded. Please try again later.');
        }
        if (ErrorHandler.isNetworkError(error)) {
          throw new AIError('Network error while connecting to Groq');
        }
        throw new AIError('Groq request failed: ' + ErrorHandler.handle(error));
      }
    });
  }
}