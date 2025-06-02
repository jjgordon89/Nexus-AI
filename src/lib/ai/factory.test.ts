import { AIProviderFactory } from './factory';
import { AIError } from './error';

// Mock the provider modules
jest.mock('./providers/openai', () => ({
  OpenAIProvider: jest.fn().mockImplementation((apiKey) => {
    if (apiKey === 'invalid-key') {
      throw new Error('Invalid API key');
    }
    return { 
      chat: jest.fn().mockResolvedValue({
        id: 'test-id',
        model: 'gpt-4',
        message: {
          role: 'assistant',
          content: 'This is a test response from OpenAI',
        },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
    };
  }),
}));

jest.mock('./providers/anthropic', () => ({
  AnthropicProvider: jest.fn().mockImplementation((apiKey) => {
    if (apiKey === 'invalid-key') {
      throw new Error('Invalid API key');
    }
    return { 
      chat: jest.fn().mockResolvedValue({
        id: 'test-id',
        model: 'claude-3-opus',
        message: {
          role: 'assistant',
          content: 'This is a test response from Anthropic',
        },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      }),
    };
  }),
}));

// Mock secure storage
jest.mock('../secure-storage', () => ({
  secureStorage: {
    getItem: jest.fn().mockImplementation((key) => {
      if (key === 'api_key') return 'test-api-key';
      return null;
    }),
  },
}));

// Mock settings store
jest.mock('../../store/settings-store', () => ({
  useSettingsStore: {
    getState: jest.fn().mockReturnValue({
      getSecureApiKey: jest.fn().mockReturnValue('test-api-key'),
    }),
  },
}));

describe('AIProviderFactory', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates an OpenAI provider successfully', async () => {
    const provider = await AIProviderFactory.createProvider('openai', 'valid-key');
    
    expect(provider).toBeDefined();
    expect(provider.chat).toBeDefined();
  });

  it('creates an Anthropic provider successfully', async () => {
    const provider = await AIProviderFactory.createProvider('anthropic', 'valid-key');
    
    expect(provider).toBeDefined();
    expect(provider.chat).toBeDefined();
  });

  it('throws an error for invalid API keys', async () => {
    await expect(AIProviderFactory.createProvider('openai', 'invalid-key'))
      .rejects
      .toThrow();
  });

  it('throws an error for unsupported providers', async () => {
    await expect(AIProviderFactory.createProvider('unsupported-provider', 'valid-key'))
      .rejects
      .toThrow(AIError);
  });

  it('retrieves the API key from secure storage if not provided', async () => {
    const provider = await AIProviderFactory.createProvider('openai');
    
    expect(provider).toBeDefined();
    expect(provider.chat).toBeDefined();
  });

  it('caches provider instances for reuse', async () => {
    // Create two providers with the same parameters
    const provider1 = await AIProviderFactory.createProvider('openai', 'valid-key');
    const provider2 = await AIProviderFactory.createProvider('openai', 'valid-key');
    
    // They should be the same instance
    expect(provider1).toBe(provider2);
  });
});