import { HfInference } from '@huggingface/inference';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class HuggingFaceProvider extends BaseAIProvider {
  protected serviceName = 'HuggingFace';
  private client: HfInference;

  constructor(apiKey: string) {
    super(apiKey);

    try {
      this.client = new HfInference(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize HuggingFace client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    const messagesText = request.messages.map(msg => {
      const role = msg.role === 'assistant' ? 'Assistant' : msg.role === 'user' ? 'User' : 'System';
      return `${role}: ${msg.content}`;
    }).join('\n\n');

    const response = await this.client.textGeneration({
      model: request.model,
      inputs: messagesText,
      parameters: {
        temperature: request.temperature,
        max_new_tokens: request.maxTokens,
        return_full_text: false,
      },
    });

    if (!response.generated_text) {
      throw new AIError('Empty response from HuggingFace');
    }

    return this.formatAIResponse(
      'hf-' + Date.now(),
      request.model,
      response.generated_text
    );
  }

  async createEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new AIError('Empty text provided for embedding');
    }

    const response = await this.client.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });
    
    if (!Array.isArray(response)) {
      throw new AIError('Invalid embedding response format');
    }

    return response;
  }
}