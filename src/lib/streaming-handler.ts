import { AIError } from './ai/error';
import { Message } from '../types';

type StreamCallback = (chunk: string) => void;

interface StreamOptions {
  onToken?: StreamCallback;
  onError?: (error: Error) => void;
  onComplete?: (fullResponse: string) => void;
  signal?: AbortSignal;
}

export class StreamingHandler {
  static async handleStream(
    stream: ReadableStream<Uint8Array>,
    options: StreamOptions = {}
  ): Promise<string> {
    const { onToken, onError, onComplete, signal } = options;
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      const reader = stream.getReader();
      
      if (signal) {
        signal.addEventListener('abort', () => {
          reader.cancel();
          throw new AIError('Stream aborted by user');
        });
      }

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        
        if (onToken) {
          onToken(chunk);
        }
      }

      if (onComplete) {
        onComplete(fullResponse);
      }

      return fullResponse;
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  }

  static createMessageStream(
    initialMessage: Message,
    onUpdate: (message: Message) => void
  ): { stream: (chunk: string) => void; abort: () => void } {
    let content = initialMessage.content;
    const abortController = new AbortController();

    return {
      stream: (chunk: string) => {
        content += chunk;
        onUpdate({
          ...initialMessage,
          content,
        });
      },
      abort: () => {
        abortController.abort();
      }
    };
  }

  static async processStreamResponse(
    response: Response,
    onChunk: (chunk: any) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIError('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const chunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.warn('Failed to parse chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}