/**
 * API Client for making requests to the NexusAI backend
 * 
 * This module provides functions for interacting with the API endpoints.
 */

import { Message, Conversation, Attachment } from '../types';
import { UserSettings } from '../types/settings';

// Base URL for API requests
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/api';

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * File upload function
 */
async function uploadFile(file: File): Promise<Attachment> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `File upload failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

/**
 * API client with methods for each endpoint
 */
export const apiClient = {
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
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          provider,
          model,
          messages,
          ...options,
        }),
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