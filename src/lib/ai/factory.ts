import { AIProvider } from './types';
import { AIError } from './error';
import { useSettingsStore } from '../../store/settings-store';
import { config } from '../../config/env';

/**
 * Regex patterns to validate API key formats for different providers
 */
const API_KEY_PATTERNS = {
  openai: /^sk-[A-Za-z0-9]{32,}$/,
  google: /^[A-Za-z0-9_-]{39}$/,
  anthropic: /^sk-ant-[A-Za-z0-9]{32,}$/,
  groq: /^gsk_[A-Za-z0-9]{32,}$/,
  mistral: /^[A-Za-z0-9]{32,}$/,
  huggingface: /^hf_[A-Za-z0-9]{32,}$/,
};

/**
 * Validates an API key against the expected format for a given provider
 * 
 * @param provider - The AI provider name
 * @param apiKey - The API key to validate
 * @throws {AIError} If the API key doesn't match the expected format
 */
const validateApiKey = (provider: string, apiKey: string): void => {
  const pattern = API_KEY_PATTERNS[provider as keyof typeof API_KEY_PATTERNS];
  if (!pattern) return; // Skip validation for unknown providers

  if (!pattern.test(apiKey)) {
    throw new AIError(`Invalid API key format for ${provider}`);
  }
};

/**
 * Validates that a URL string is properly formatted
 * 
 * @param url - The URL to validate
 * @throws {AIError} If the URL is not properly formatted
 */
const validateBaseUrl = (url: string): void => {
  try {
    new URL(url);
  } catch {
    throw new AIError('Invalid base URL format');
  }
};

/**
 * Factory class for creating AI provider instances
 * 
 * This class implements the Factory pattern to create appropriate AI provider
 * instances based on the requested provider type. It handles:
 * - Provider instantiation with proper configuration
 * - Caching of provider instances for reuse
 * - API key validation and security
 * - Rate limiting to prevent API abuse
 * - Dynamic loading of provider modules to reduce initial bundle size
 */
export class AIProviderFactory {
  // Singleton cache of provider instances for reuse
  private static providerInstances: Map<string, AIProvider> = new Map();
  
  /**
   * Creates an AI provider instance based on the specified provider type
   * 
   * This method dynamically imports the appropriate provider module to 
   * reduce initial bundle size and only load what's needed.
   * 
   * @param provider - The type of AI provider to create
   * @param apiKey - Optional API key (retrieved from secure storage if not provided)
   * @param baseUrl - Optional base URL for custom API endpoints
   * @returns A Promise resolving to an AIProvider instance
   * @throws {AIError} If provider creation fails for any reason
   */
  static async createProvider(provider: string, apiKey?: string, baseUrl?: string): Promise<AIProvider> {
    // Get the secure API key if none provided
    if (!apiKey) {
      // Try getting from .env file via config
      const configKey = config.api[provider as keyof typeof config.api];
      if (configKey) {
        apiKey = configKey;
      } else {
        // Fallback to secure store
        apiKey = useSettingsStore.getState().getSecureApiKey();
      }
    }
    
    // Get base URL from config if not provided
    if (!baseUrl && provider === 'openai') {
      baseUrl = config.apiBaseUrls.openai;
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

      // Dynamically import the provider module based on selection
      switch (provider.toLowerCase()) {
        case 'openai':
          const { OpenAIProvider } = await import('./providers/openai');
          providerInstance = new OpenAIProvider(apiKey, baseUrl);
          break;
        case 'google':
          const { GoogleProvider } = await import('./providers/google');
          providerInstance = new GoogleProvider(apiKey);
          break;
        case 'groq':
          const { GroqProvider } = await import('./providers/groq');
          providerInstance = new GroqProvider(apiKey);
          break;
        case 'mistral':
          const { MistralProvider } = await import('./providers/mistral');
          providerInstance = new MistralProvider(apiKey);
          break;
        case 'anthropic':
          const { AnthropicProvider } = await import('./providers/anthropic');
          providerInstance = new AnthropicProvider(apiKey);
          break;
        case 'huggingface':
          const { HuggingFaceProvider } = await import('./providers/huggingface');
          providerInstance = new HuggingFaceProvider(apiKey);
          break;
        case 'openai-compatible':
          if (!baseUrl) {
            throw new AIError('Base URL is required for OpenAI-compatible providers');
          }
          const { OpenAIProvider: OpenAICompatProvider } = await import('./providers/openai');
          providerInstance = new OpenAICompatProvider(apiKey, baseUrl);
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

  /**
   * Tracking object for rate limiting
   * Keys are time periods (minutes), values are request counts
   */
  private static requestCounts: { [key: number]: number } = {};

  /**
   * Gets the current request count for rate limiting
   * @returns The number of requests in the current minute
   */
  private static getRequestCount(): number {
    const now = Math.floor(Date.now() / 1000 / 60); // Current minute
    return this.requestCounts[now] || 0;
  }

  /**
   * Increments the request count for the current minute
   * Also cleans up old count data to prevent memory leaks
   */
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