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
  // Singleton cache of provider instances for reuse
  private static providerInstances: Map<string, AIProvider> = new Map();
  
  static createProvider(provider: string, apiKey?: string, baseUrl?: string): AIProvider {
    // Get the secure API key if none provided
    if (!apiKey) {
      apiKey = useSettingsStore.getState().getSecureApiKey();
    }
    
    if (!apiKey) {
      throw new AIError('API key is required');
    }

    // Check for cached provider instance first
    const cacheKey = `${provider}:${apiKey}:${baseUrl || ''}`;
    if (this.providerInstances.has(cacheKey)) {
      return this.providerInstances.get(cacheKey)!;
    }

    // Rate limit check
    const requestCount = this.getRequestCount();
    if (requestCount > 100) { // 100 requests per minute
      throw new AIError('Rate limit exceeded. Please try again later.');
    }
    
    this.incrementRequestCount();

    try {
      // Validate API key format
      validateApiKey(provider.toLowerCase(), apiKey);

      // Validate base URL if provided
      if (baseUrl) {
        validateBaseUrl(baseUrl);
      }

      let providerInstance: AIProvider;

      switch (provider.toLowerCase()) {
        case 'openai':
          providerInstance = new OpenAIProvider(apiKey);
          break;
        case 'google':
          providerInstance = new GoogleProvider(apiKey);
          break;
        case 'groq':
          providerInstance = new GroqProvider(apiKey);
          break;
        case 'mistral':
          providerInstance = new MistralProvider(apiKey);
          break;
        case 'anthropic':
          providerInstance = new AnthropicProvider(apiKey);
          break;
        case 'huggingface':
          providerInstance = new HuggingFaceProvider(apiKey);
          break;
        case 'openai-compatible':
          if (!baseUrl) {
            throw new AIError('Base URL is required for OpenAI-compatible providers');
          }
          providerInstance = new OpenAIProvider(apiKey, baseUrl);
          break;
        default:
          throw new AIError(`Unsupported AI provider: ${provider}`);
      }

      // Cache the provider instance
      this.providerInstances.set(cacheKey, providerInstance);
      return providerInstance;
      
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