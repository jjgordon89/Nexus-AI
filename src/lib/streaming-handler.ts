import { AIError } from './ai/error';
import { Message } from '../types';

type StreamCallback = (chunk: string) => void;

interface StreamOptions {
  onToken?: StreamCallback;
  onError?: (error: Error) => void;
  onComplete?: (fullResponse: string) => void;
  signal?: AbortSignal;
}

/**
 * Utility class for handling streaming responses from AI providers
 * 
 * This class provides:
 * - Methods for processing ReadableStream responses
 * - Support for token-by-token streaming
 * - Integration with the message UI for real-time updates
 * - Error handling and abortable streams
 */
export class StreamingHandler {
  /**
   * Processes a ReadableStream of text chunks
   * 
   * @param stream - The ReadableStream to process
   * @param options - Configuration options for streaming
   * @returns Promise with the complete streamed content
   * @throws {AIError} If the stream is aborted or fails
   */
  static async handleStream(
    stream: ReadableStream<Uint8Array>,
    options: StreamOptions = {}
  ): Promise<string> {
    const { onToken, onError, onComplete, signal } = options;
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      const reader = stream.getReader();
      
      // Set up abort handling if signal is provided
      if (signal) {
        signal.addEventListener('abort', () => {
          reader.cancel();
          throw new AIError('Stream aborted by user');
        });
      }

      // Process the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        
        // Call the token callback if provided
        if (onToken) {
          onToken(chunk);
        }
      }

      // Call the complete callback if provided
      if (onComplete) {
        onComplete(fullResponse);
      }

      return fullResponse;
    } catch (error) {
      // Pass the error to the error callback if provided
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  }

  /**
   * Creates a message stream handler for updating UI in real-time
   * 
   * @param initialMessage - The initial message to start with
   * @param onUpdate - Callback to update the message in the UI
   * @returns Object with stream and abort methods
   */
  static createMessageStream(
    initialMessage: Message,
    onUpdate: (message: Message) => void
  ): { stream: (chunk: string) => void; abort: () => void } {
    let content = initialMessage.content;
    const abortController = new AbortController();

    return {
      // Stream handler function that appends chunks to the message
      stream: (chunk: string) => {
        content += chunk;
        onUpdate({
          ...initialMessage,
          content,
        });
      },
      // Abort function to cancel streaming
      abort: () => {
        abortController.abort();
      }
    };
  }

  /**
   * Processes a streaming response that follows the SSE format
   * (Server-Sent Events) commonly used by AI APIs
   * 
   * @param response - The HTTP response with streaming data
   * @param onChunk - Callback for each parsed chunk
   * @throws {AIError} If the stream cannot be read or parsed
   */
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

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines in buffer
        const lines = buffer.split('\n');
        
        // Last line might be incomplete, save it for next iteration
        buffer = lines.pop() || '';

        // Process each complete line
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