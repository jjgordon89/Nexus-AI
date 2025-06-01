import { HfInference } from '@huggingface/inference';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';

export class HuggingFaceProvider implements AIProvider {
  private client: HfInference;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('HuggingFace API key is required');
    }

    try {
      this.client = new HfInference(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize HuggingFace client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return ErrorHandler.handleAsync(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      try {
        const response = await this.client.textGeneration({
          model: request.model,
          inputs: request.messages.map(msg => msg.content).join('\n'),
          parameters: {
            temperature: request.temperature,
            max_new_tokens: request.maxTokens,
          },
        });

        if (!response.generated_text) {
          throw new AIError('Empty response from HuggingFace');
        }

        return {
          id: 'hf-' + Date.now(),
          model: request.model,
          message: {
            role: 'assistant',
            content: response.generated_text,
          },
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      } catch (error) {
        if (ErrorHandler.isAuthError(error)) {
          throw new AIError('Invalid or expired HuggingFace API key');
        }
        if (ErrorHandler.isRateLimitError(error)) {
          throw new AIError('HuggingFace rate limit exceeded. Please try again later.');
        }
        if (ErrorHandler.isNetworkError(error)) {
          throw new AIError('Network error while connecting to HuggingFace');
        }
        throw new AIError('HuggingFace request failed: ' + ErrorHandler.handle(error));
      }
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    return ErrorHandler.handleAsync(async () => {
      if (!text.trim()) {
        throw new AIError('Empty text provided for embedding');
      }

      try {
        const response = await this.client.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: text,
        });
        
        if (!Array.isArray(response)) {
          throw new AIError('Invalid embedding response format');
        }

        return response;
      } catch (error) {
        throw new AIError('HuggingFace embedding creation failed: ' + ErrorHandler.handle(error));
      }
    });
  }
}