/**
 * API Error class
 * 
 * Custom error class for API-related errors with status codes and
 * structured error information.
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /**
   * Create an API error from a response
   */
  static async fromResponse(response: Response): Promise<ApiError> {
    let errorData = null;
    
    try {
      errorData = await response.json();
    } catch (e) {
      // If JSON parsing fails, use a generic error
      return new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status
      );
    }
    
    const message = errorData.message || errorData.error || `API Error: ${response.status}`;
    const code = errorData.code || errorData.error;
    const details = errorData.details || null;
    
    return new ApiError(message, response.status, code, details);
  }
}