import { AIError } from './ai/error';

export class ErrorHandler {
  static handle(error: unknown): string {
    if (error instanceof AIError) {
      return error.message;
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.name === 'TypeError') {
        return 'An unexpected type error occurred. Please try again.';
      }
      if (error.name === 'NetworkError') {
        return 'Network error. Please check your connection and try again.';
      }
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  static async handleAsync<T>(
    operation: () => Promise<T>,
    errorHandler?: (error: unknown) => void
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = this.handle(error);
      if (errorHandler) {
        errorHandler(error);
      } else {
        console.error(message, error);
      }
      throw error;
    }
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof Error && 
           (error.name === 'NetworkError' || error.message.includes('network'));
  }

  static isAuthError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('authentication') || 
            error.message.includes('unauthorized') ||
            error.message.includes('api key'));
  }

  static isRateLimitError(error: unknown): boolean {
    return error instanceof Error && 
           (error.message.includes('rate limit') || 
            error.message.includes('too many requests'));
  }
}