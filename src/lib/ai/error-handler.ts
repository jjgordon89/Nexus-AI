import { AIError } from './error';

/**
 * Enhanced error handler specifically for AI-related errors
 * Provides consistent error handling across all AI providers
 */
export class AIErrorHandler {
  // Error categories
  static readonly CATEGORY = {
    AUTHENTICATION: 'authentication',
    RATE_LIMIT: 'rate_limit',
    NETWORK: 'network',
    SERVER: 'server',
    VALIDATION: 'validation',
    TIMEOUT: 'timeout',
    MODEL: 'model',
    CONTENT_FILTER: 'content_filter',
    QUOTA: 'quota',
    UNKNOWN: 'unknown'
  };
  
  /**
   * Analyzes an error and determines its category
   */
  static categorizeError(error: unknown): string {
    const message = error instanceof Error ? error.message.toLowerCase() : '';
    const name = error instanceof Error ? error.name : '';
    
    // Authentication errors
    if (
      message.includes('api key') || 
      message.includes('auth') || 
      message.includes('unauthoriz') || 
      message.includes('not authorized') ||
      message.includes('invalid key')
    ) {
      return this.CATEGORY.AUTHENTICATION;
    }
    
    // Rate limit errors
    if (
      message.includes('rate limit') || 
      message.includes('too many requests') ||
      message.includes('ratelimit')
    ) {
      return this.CATEGORY.RATE_LIMIT;
    }
    
    // Network errors
    if (
      name.includes('NetworkError') || 
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('cors')
    ) {
      return this.CATEGORY.NETWORK;
    }
    
    // Server errors
    if (
      message.includes('server error') || 
      message.includes('internal error') ||
      message.includes('500')
    ) {
      return this.CATEGORY.SERVER;
    }
    
    // Validation errors
    if (
      message.includes('validation') || 
      message.includes('invalid') ||
      message.includes('not valid')
    ) {
      return this.CATEGORY.VALIDATION;
    }
    
    // Timeout errors
    if (message.includes('timeout')) {
      return this.CATEGORY.TIMEOUT;
    }
    
    // Model-specific errors
    if (
      message.includes('model') || 
      message.includes('not found') ||
      message.includes('not available')
    ) {
      return this.CATEGORY.MODEL;
    }
    
    // Content filter errors
    if (
      message.includes('content filter') || 
      message.includes('content policy') ||
      message.includes('policy violation') ||
      message.includes('harmful content')
    ) {
      return this.CATEGORY.CONTENT_FILTER;
    }
    
    // Quota errors
    if (
      message.includes('quota') || 
      message.includes('limit') ||
      message.includes('billing') ||
      message.includes('exceeded')
    ) {
      return this.CATEGORY.QUOTA;
    }
    
    return this.CATEGORY.UNKNOWN;
  }
  
  /**
   * Returns a user-friendly error message based on the error category
   */
  static getUserMessage(error: unknown): string {
    const category = this.categorizeError(error);
    const baseMessage = error instanceof Error ? error.message : 'An error occurred';
    
    switch (category) {
      case this.CATEGORY.AUTHENTICATION:
        return 'Authentication failed. Please check your API key in settings.';
        
      case this.CATEGORY.RATE_LIMIT:
        return 'Rate limit exceeded. Please try again in a few moments.';
        
      case this.CATEGORY.NETWORK:
        return 'Network error. Please check your internet connection and try again.';
        
      case this.CATEGORY.SERVER:
        return 'The AI service is experiencing issues. Please try again later.';
        
      case this.CATEGORY.VALIDATION:
        return 'Invalid request. Please check your input and try again.';
        
      case this.CATEGORY.TIMEOUT:
        return 'The request timed out. Please try again or use a faster connection.';
        
      case this.CATEGORY.MODEL:
        return 'The selected AI model is unavailable. Please try a different model in settings.';
        
      case this.CATEGORY.CONTENT_FILTER:
        return 'Your message was flagged by content filters. Please modify your request.';
        
      case this.CATEGORY.QUOTA:
        return 'You have reached your usage quota. Please check your subscription.';
        
      case this.CATEGORY.UNKNOWN:
      default:
        return baseMessage;
    }
  }
  
  /**
   * Handles an error and returns a standardized AIError
   */
  static handleError(error: unknown): AIError {
    const userMessage = this.getUserMessage(error);
    
    if (error instanceof AIError) {
      // Already an AIError, just update the message if needed
      error.message = userMessage;
      return error;
    }
    
    return new AIError(userMessage, error);
  }
  
  /**
   * Wraps an async function with standardized error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    customErrorHandler?: (error: AIError) => void
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const aiError = this.handleError(error);
      
      if (customErrorHandler) {
        customErrorHandler(aiError);
      }
      
      throw aiError;
    }
  }
}