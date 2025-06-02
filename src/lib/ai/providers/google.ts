import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class GoogleProvider extends BaseAIProvider {
  protected serviceName = 'Google AI';
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super(apiKey);
    
    try {
      this.client = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize Google AI client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
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

    return this.formatAIResponse(
      crypto.randomUUID(),
      request.model,
      responseText,
      promptTokens,
      completionTokens
    );
  }

  protected async streamingChat(request: AIRequest): Promise<AIResponse> {
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
    const result = await chat.sendMessageStream(lastMessage.content);
    
    let content = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      content += chunkText;
      if (request.onToken) {
        request.onToken(chunkText);
      }
    }

    return this.formatAIResponse(
      crypto.randomUUID(),
      request.model,
      content
    );
  }
}