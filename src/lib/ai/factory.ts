import { AIProvider } from './types';
import { OpenAIProvider } from './providers/openai';
import { GoogleProvider } from './providers/google';
import { GroqProvider } from './providers/groq';
import { MistralProvider } from './providers/mistral';
import { AnthropicProvider } from './providers/anthropic';
import { HuggingFaceProvider } from './providers/huggingface';
import { AIError } from './error';
import { useSettingsStore } from '../../store/settings-store';

const API_KEY_PATTERNS = {
  openai: /^sk-[A-Za-z0-9]{32,}$/,
  google: /^[A-Za-z0-9_-]{39}$/,
  anthropic: /^sk-ant-[A-Za-z0-9]{32,}$/,
  groq: /^gsk_[A-Za-z0-9]{32,}$/,
  mistral: /^[A-Za-z0-9]{32,}$/,
  huggingface: /^hf_[A-Za-z0-9]{32,}$/,
};

const validateApiKey = (provider: string, apiKey: string): void => {
  const pattern = API_KEY_PATTERNS[provider as keyof typeof API_KEY_PATTERNS];
  if (!pattern) return; // Skip validation for unknown providers

  if (!pattern.test(apiKey)) {
    throw new AIError(`Invalid API key format for ${provider}`);
  }
};

const validateBaseUrl = (url: string): void => {
  try {
    new URL(url);
  } catch {
    throw new AIError('Invalid base URL format');
  }
};

export class AIProviderFactory {
  static createProvider(provider: string, apiKey?: string, baseUrl?: string): AIProvider {
    // Get the secure API key if none provided
    if (!apiKey) {
      apiKey = useSettingsStore.getState().getSecureApiKey();
    }
    
    if (!apiKey) {
      throw new AIError('API key is required');
    }

    // Rate limit check
    const requestCount = this.getRequestCount();
    if (requestCount > 100) { // 100 requests per minute
      throw new AIError('Rate limit exceeded. Please try again later.');
    }

    try {
      // Validate API key format
      validateApiKey(provider.toLowerCase(), apiKey);

      // Validate base URL if provided
      if (baseUrl) {
        validateBaseUrl(baseUrl);
      }

      switch (provider.toLowerCase()) {
        case 'openai':
          return new OpenAIProvider(apiKey);
        case 'google':
          return new GoogleProvider(apiKey);
        case 'groq':
          return new GroqProvider(apiKey);
        case 'mistral':
          return new MistralProvider(apiKey);
        case 'anthropic':
          return new AnthropicProvider(apiKey);
        case 'huggingface':
          return new HuggingFaceProvider(apiKey);
        case 'openai-compatible':
          if (!baseUrl) {
            throw new AIError('Base URL is required for OpenAI-compatible providers');
          }
          return new OpenAIProvider(apiKey, baseUrl);
        default:
          throw new AIError(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError('Failed to initialize AI provider', error);
    }
  }

  private static requestCounts: { [key: number]: number } = {};

  private static getRequestCount(): number {
    const now = Math.floor(Date.now() / 1000 / 60); // Current minute
    return this.requestCounts[now] || 0;
  }

  private static incrementRequestCount(): void {
    const now = Math.floor(Date.now() / 1000 / 60);
    this.requestCounts[now] = (this.requestCounts[now] || 0) + 1;

    // Cleanup old counts
    Object.keys(this.requestCounts).forEach(minute => {
      if (parseInt(minute) < now - 5) { // Keep last 5 minutes
        delete this.requestCounts[parseInt(minute)];
      }
    });
  }
}