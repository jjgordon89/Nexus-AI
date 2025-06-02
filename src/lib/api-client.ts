/**
 * API Client for making requests to the NexusAI backend
 * 
 * This module provides functions for interacting with the API endpoints.
 */

import { Message, Conversation, Attachment } from '../types';
import { UserSettings } from '../types/settings';
import { sanitizeJson } from './sanitizer';

// Base URL for API requests
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/api';

// Store the auth token
let authToken: string | null = null;

/**
 * Set the authentication token for API requests
 */
export function setAuthToken(token: string | null) {
  authToken = token;
  
  // Store the token in localStorage (with expiry)
  if (token) {
    const tokenData = {
      value: token,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    localStorage.setItem('auth_token', JSON.stringify(tokenData));
  } else {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Get the stored authentication token
 */
export function getAuthToken(): string | null {
  if (authToken) {
    return authToken;
  }
  
  // Try to get from localStorage
  const tokenData = localStorage.getItem('auth_token');
  if (tokenData) {
    try {
      const { value, expires } = JSON.parse(tokenData);
      if (Date.now() < expires) {
        authToken = value;
        return value;
      } else {
        // Token expired, remove it
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  
  return null;
}

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    // Get the auth token
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      credentials: 'include', // Include cookies for authentication
      body: body ? JSON.stringify(sanitizeJson(body)) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Handle unauthorized errors
      if (response.status === 401) {
        // Clear the token
        setAuthToken(null);
      }
      
      throw new Error(
        errorData?.message || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return sanitizeJson<T>(data);
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * File upload function with security measures
 */
async function uploadFile(file: File): Promise<Attachment> {
  try {
    // Get the auth token
    const token = getAuthToken();
    
    // Create a new FormData instance
    const formData = new FormData();
    
    // Validate file before upload
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('File size exceeds 25MB limit');
    }
    
    // Whitelist of allowed MIME types
    const allowedTypes = [
      'text/plain', 
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported');
    }
    
    formData.append('file', file);

    const headers: Record<string, string> = {};
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers,
      credentials: 'include', // Include cookies for authentication
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `File upload failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return sanitizeJson<Attachment>(data);
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

/**
 * Authentication API functions
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<{ user: any; token: string }> => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/login', 'POST', {
      email,
      password,
    });
    
    // Store the token
    setAuthToken(response.token);
    
    return response;
  },
  
  /**
   * Register a new user
   */
  register: async (email: string, password: string, name?: string): Promise<{ user: any; token: string }> => {
    const response = await apiRequest<{ user: any; token: string }>('/auth/register', 'POST', {
      email,
      password,
      name,
    });
    
    // Store the token
    setAuthToken(response.token);
    
    return response;
  },
  
  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    await apiRequest('/auth/logout', 'POST');
    setAuthToken(null);
  },
  
  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiRequest('/auth/change-password', 'POST', {
      currentPassword,
      newPassword,
    });
  },
  
  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiRequest('/auth/request-reset', 'POST', {
      email,
    });
  },
  
  /**
   * Reset password
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiRequest('/auth/reset-password', 'POST', {
      token,
      newPassword,
    });
  },
};

/**
 * API client with methods for each endpoint
 */
export const apiClient = {
  /**
   * Auth API
   */
  auth: authApi,

  /**
   * Chat API
   */
  chat: {
    /**
     * Send a chat request to an AI provider
     */
    send: async (
      provider: string,
      model: string,
      messages: { role: string; content: string }[],
      options?: { temperature?: number; maxTokens?: number }
    ) => {
      return apiRequest('/chat', 'POST', {
        provider,
        model,
        messages,
        ...options,
      });
    },

    /**
     * Send a streaming chat request (returns a ReadableStream)
     */
    stream: async (
      provider: string,
      model: string,
      messages: { role: string; content: string }[],
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<ReadableStream> => {
      // Get the auth token
      const token = getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(sanitizeJson({
          provider,
          model,
          messages,
          ...options,
        })),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Streaming request failed with status ${response.status}`
        );
      }

      return response.body as ReadableStream;
    },
  },

  /**
   * Conversation API
   */
  conversations: {
    /**
     * Get all conversations
     */
    getAll: async (): Promise<Conversation[]> => {
      const response = await apiRequest<{ conversations: any[] }>('/conversations');
      
      // Convert API response to application types
      return response.conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        model: conv.model,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: [], // Messages are loaded separately
      }));
    },

    /**
     * Get a conversation by ID
     */
    get: async (id: string): Promise<Conversation> => {
      const response = await apiRequest<any>(`/conversations/${id}`);
      
      // Convert timestamps to Date objects
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        messages: response.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    },

    /**
     * Create a new conversation
     */
    create: async (title: string, model: string): Promise<Conversation> => {
      const response = await apiRequest<any>('/conversations', 'POST', {
        title,
        model,
      });
      
      // Convert timestamps to Date objects
      return {
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        messages: [], // New conversation has no messages
      };
    },

    /**
     * Update a conversation
     */
    update: async (id: string, updates: { title?: string; model?: string }): Promise<void> => {
      await apiRequest(`/conversations/${id}`, 'PUT', updates);
    },

    /**
     * Delete a conversation
     */
    delete: async (id: string): Promise<void> => {
      await apiRequest(`/conversations/${id}`, 'DELETE');
    },

    /**
     * Add a message to a conversation
     */
    addMessage: async (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
      const response = await apiRequest<any>(`/conversations/${conversationId}/messages`, 'POST', message);
      
      // Convert timestamp to Date object
      return {
        ...response,
        timestamp: new Date(response.timestamp),
      };
    },
  },

  /**
   * File API
   */
  files: {
    /**
     * Upload a file
     */
    upload: uploadFile,

    /**
     * Get a file URL
     */
    getUrl: (id: string): string => {
      return `${API_BASE_URL}/files/${id}`;
    },

    /**
     * Delete a file
     */
    delete: async (id: string): Promise<void> => {
      await apiRequest(`/files/${id}`, 'DELETE');
    },
  },

  /**
   * Settings API
   */
  settings: {
    /**
     * Get user settings
     */
    get: async (): Promise<UserSettings> => {
      const response = await apiRequest<{ settings: UserSettings }>('/settings');
      return response.settings;
    },

    /**
     * Update user settings
     */
    update: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
      const response = await apiRequest<{ settings: UserSettings }>('/settings', 'PUT', settings);
      return response.settings;
    },
  },
};