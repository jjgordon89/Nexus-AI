/**
 * Interface for retry operation configuration
 */
interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[];
}

import { AIError } from './ai/error';

/**
 * Default retry configuration values
 */
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

/**
 * Utility class for handling retries of operations that might fail
 * 
 * Implements an exponential backoff strategy to space out retries
 * and avoid overwhelming services that may be experiencing issues.
 */
export class RetryHandler {
  /**
   * Executes an operation with retry capability
   * 
   * @param operation - The async function to execute with retries
   * @param options - Configuration options for the retry behavior
   * @returns Promise with the operation result
   * @throws AIError if all retry attempts fail
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;
    let delay = config.initialDelay;

    // Try the operation up to maxAttempts times
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if this error is retryable
        if (!this.isRetryableError(lastError, config.retryableErrors)) {
          throw error;
        }

        // If this was the last attempt, throw a wrapped error
        if (attempt === config.maxAttempts) {
          throw new AIError(
            `Operation failed after ${config.maxAttempts} attempts: ${lastError.message}`,
            lastError
          );
        }

        // Wait before retrying with exponential backoff
        await this.sleep(delay);
        delay = Math.min(delay * config.backoffFactor, config.maxDelay);
      }
    }

    throw lastError;
  }

  /**
   * Determines if an error is retryable based on its message or type
   * 
   * @param error - The error to check
   * @param retryableErrors - List of error strings that indicate retryable errors
   * @returns Boolean indicating if the error is retryable
   */
  private static isRetryableError(error: Error, retryableErrors: string[]): boolean {
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(type => errorMessage.includes(type)) ||
           error.name === 'NetworkError' ||
           error.name === 'TimeoutError';
  }

  /**
   * Creates a promise that resolves after a specified delay
   * 
   * @param ms - Number of milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}