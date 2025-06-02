/**
 * Mock implementations for AI providers
 * 
 * This module provides mock implementations of the AI providers for testing.
 */

import { AIProvider, AIRequest, AIResponse } from '../../lib/ai/types';

/**
 * Common mock response generator for all providers
 */
const createMockResponse = (id: string, model: string, content: string): AIResponse => ({
  id: id || 'mock-response-id',
  model: model,
  message: {
    role: 'assistant',
    content: content,
  },
  usage: {
    promptTokens: 10,
    completionTokens: 20,
    totalTokens: 30,
  },
});

/**
 * Mock OpenAI provider
 */
export class MockOpenAIProvider implements AIProvider {
  constructor(private apiKey: string) {
    // Validate API key
    if (!apiKey || apiKey === 'invalid-key') {
      throw new Error('Invalid API key');
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Handle streaming if enabled
    if (request.stream && request.onToken) {
      const response = "I'm a mock OpenAI response for testing purposes.";
      const words = response.split(' ');
      
      for (const word of words) {
        request.onToken(word + ' ');
        // Small delay between tokens
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return createMockResponse(
      'openai-mock-id',
      request.model,
      "I'm a mock OpenAI response for testing purposes."
    );
  }

  async createEmbedding(text: string): Promise<number[]> {
    // Generate a deterministic mock embedding based on the input text
    return Array.from({ length: 10 }, (_, i) => 
      (text.charCodeAt(i % text.length) || 0) / 255
    );
  }
}

/**
 * Mock Anthropic provider
 */
export class MockAnthropicProvider implements AIProvider {
  constructor(private apiKey: string) {
    if (!apiKey || apiKey === 'invalid-key') {
      throw new Error('Invalid API key');
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (request.stream && request.onToken) {
      const response = "I'm a mock Anthropic Claude response for testing purposes.";
      const words = response.split(' ');
      
      for (const word of words) {
        request.onToken(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return createMockResponse(
      'anthropic-mock-id',
      request.model,
      "I'm a mock Anthropic Claude response for testing purposes."
    );
  }
}

/**
 * Mock Google AI provider
 */
export class MockGoogleProvider implements AIProvider {
  constructor(private apiKey: string) {
    if (!apiKey || apiKey === 'invalid-key') {
      throw new Error('Invalid API key');
    }
  }

  async chat(request: AIRequest): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (request.stream && request.onToken) {
      const response = "I'm a mock Google Gemini response for testing purposes.";
      const words = response.split(' ');
      
      for (const word of words) {
        request.onToken(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return createMockResponse(
      'google-mock-id',
      request.model,
      "I'm a mock Google Gemini response for testing purposes."
    );
  }
}

/**
 * Mock provider factory for testing
 */
export class MockAIProviderFactory {
  static async createProvider(provider: string, apiKey: string): Promise<AIProvider> {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new MockOpenAIProvider(apiKey);
      case 'anthropic':
        return new MockAnthropicProvider(apiKey);
      case 'google':
        return new MockGoogleProvider(apiKey);
      default:
        return new MockOpenAIProvider(apiKey);
    }
  }
}