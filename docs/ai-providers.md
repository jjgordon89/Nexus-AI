# AI Provider System Documentation

## Overview

NexusAI's AI provider system enables communication with various AI services through a consistent interface. The system is designed to be extensible, allowing easy addition of new AI providers while maintaining a unified API for the application.

## Architecture

The AI provider system follows these design patterns:

1. **Interface-Based Design**: All providers implement a common interface
2. **Template Method Pattern**: Base class defines the algorithm structure
3. **Factory Pattern**: Creates appropriate provider instances
4. **Dynamic Import**: Providers are loaded on demand to reduce bundle size

### Key Components

#### AIProvider Interface

The `AIProvider` interface (`src/lib/ai/types.ts`) defines the contract that all provider implementations must follow:

```typescript
interface AIProvider {
  chat(request: AIRequest): Promise<AIResponse>;
  createEmbedding?(text: string): Promise<number[]>;
}
```

#### BaseAIProvider Abstract Class

The `BaseAIProvider` abstract class (`src/lib/ai/base-provider.ts`) implements common functionality:

- Request validation
- Error handling
- Retry logic
- Response formatting
- Template methods for specific provider implementations

#### Provider Implementations

Each AI service has its own implementation in `src/lib/ai/providers/`:

- `OpenAIProvider`: For OpenAI's GPT models
- `AnthropicProvider`: For Anthropic's Claude models
- `GoogleProvider`: For Google's Gemini models
- `MistralProvider`: For Mistral AI models
- `GroqProvider`: For Groq's API
- `HuggingFaceProvider`: For HuggingFace models

#### Provider Factory

The `AIProviderFactory` class (`src/lib/ai/factory.ts`) is responsible for:

- Creating appropriate provider instances based on user settings
- Caching instances for reuse
- Validating API keys and configurations
- Rate limiting to prevent API abuse
- Dynamic importing of provider modules

## Request Flow

When a user sends a message, the following happens:

1. The application gets the current AI settings from the settings store
2. The `AIProviderFactory` creates the appropriate provider instance
3. The application sends the message to the provider's `chat` method
4. The provider processes the request and returns a response
5. The application updates the UI with the response

## Error Handling

The system includes comprehensive error handling:

- `AIError` class for standardized error representation
- `AIErrorHandler` utility for categorizing and handling errors
- Automatic retries for transient errors
- User-friendly error messages

## Streaming Support

Most providers support streaming responses, allowing for real-time display of AI responses:

- Providers implement the `streamingChat` method
- The application updates the UI as tokens arrive
- Streaming can be enabled/disabled in settings

## Adding a New Provider

To add a new AI provider:

1. Create a new provider class that extends `BaseAIProvider`
2. Implement the `standardChat` method
3. Implement the `streamingChat` method if streaming is supported
4. Add the provider to the `AIProviderFactory.createProvider` method

Example provider implementation:

```typescript
import { AIRequest, AIResponse } from '../types';
import { AIError } from '../error';
import { BaseAIProvider } from '../base-provider';

export class NewProvider extends BaseAIProvider {
  protected serviceName = 'New AI Service';
  private client: any;

  constructor(apiKey: string) {
    super(apiKey);
    
    try {
      this.client = new SomeAIClient(apiKey);
    } catch (error) {
      throw new AIError('Failed to initialize New AI client', error);
    }
  }

  protected async standardChat(request: AIRequest): Promise<AIResponse> {
    // Implement the provider-specific API call
    // Format and return the response
  }
}
```

## Security Considerations

The AI provider system includes security measures:

- API keys are stored securely using the `SecureStorage` utility
- Keys are not included in the application state
- API key formats are validated
- Rate limiting prevents abuse