/**
 * API Types
 * 
 * This module defines TypeScript types and Zod schemas for API requests and responses.
 */

import { z } from 'zod';
import { MessageRole, Message } from '../../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

// Chat Request Schema
export const ChatRequestSchema = z.object({
  provider: z.string(),
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system', 'function']),
      content: z.string(),
    })
  ),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Chat Response Schema
export const ChatResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  message: z.object({
    role: z.enum(['assistant', 'function']),
    content: z.string(),
  }),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// Conversation Schema
export const CreateConversationSchema = z.object({
  title: z.string().min(1).max(200),
  model: z.string(),
});

export type CreateConversationRequest = z.infer<typeof CreateConversationSchema>;

export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  model: z.string().optional(),
});

export type UpdateConversationRequest = z.infer<typeof UpdateConversationSchema>;

// Message Schema
export const CreateMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'function']),
  content: z.string().min(1),
  attachments: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      type: z.string(),
      size: z.number(),
    })
  ).optional(),
});

export type CreateMessageRequest = z.infer<typeof CreateMessageSchema>;

// Settings Schema
export const UpdateSettingsSchema = z.object({
  profile: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  appearance: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    language: z.string().optional(),
    fontSize: z.number().min(12).max(24).optional(),
  }).optional(),
  ai: z.object({
    provider: z.string().optional(),
    model: z.string().optional(),
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional(),
    systemMessage: z.string().optional(),
  }).optional(),
  // Add more settings as needed
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsSchema>;

// File Upload Schema
export const FileUploadResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  path: z.string(),
  url: z.string(),
});

export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;