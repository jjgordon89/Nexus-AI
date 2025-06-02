import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider, AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { ErrorHandler } from '../../error-handler';
import { AIErrorHandler } from '../error-handler';

export class GoogleProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new AIError('Google API key is required');
    }
    
    try {
      this.client = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize Google AI client', error);
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    return AIErrorHandler.withErrorHandling(async () => {
      if (!request.messages.length) {
        throw new AIError('No messages provided');
      }

      try {
        const model = this.client.getGenerativeModel({ model: request.model });
        const chat = model.startChat({
          history: request.messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens,
          },
        });

        const lastMessage = request.messages[request.messages.length - 1];
        const result = await chat.sendMessage(lastMessage.content);
        const response = await result.response;
        
        if (!response.text()) {
          throw new AIError('Empty response from Google AI');
        }

        // Calculate approximate token counts
        const promptText = request.messages.map(m => m.content).join(' ');
        const responseText = response.text();
        const promptTokens = Math.ceil(promptText.length / 4);
        const completionTokens = Math.ceil(responseText.length / 4);

        return {
          id: crypto.randomUUID(),
          model: request.model,
          message: {
            role: 'assistant',
            content: responseText,
          },
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
        };
      } catch (error) {
        // Let AIErrorHandler handle the error categorization
        throw error;
      }
    });
  }
}