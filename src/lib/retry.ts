import { AIError } from './ai/error';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'rate_limit_exceeded',
    'timeout',
    'network_error',
    'server_error',
    'internal_error',
  ],
};

export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!this.isRetryableError(lastError, config.retryableErrors)) {
          throw error;
        }

        if (attempt === config.maxAttempts) {
          throw new AIError(
            `Operation failed after ${config.maxAttempts} attempts: ${lastError.message}`,
            lastError
          );
        }

        await this.sleep(delay);
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    throw lastError;
  }

  private static isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(type => errorMessage.includes(type)) ||
           error.name === 'NetworkError' ||
           error.name === 'TimeoutError';
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}