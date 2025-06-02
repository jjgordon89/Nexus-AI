/**
 * Mock data for tests
 * 
 * This module provides mock data for various entity types used in tests.
 */

import { nanoid } from 'nanoid';
import { Message, Conversation, Attachment } from '../../types';
import { UserSettings } from '../../types/settings';

/**
 * Create a mock message
 */
export function createMockMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: nanoid(),
    role: 'user',
    content: 'This is a test message',
    timestamp: new Date(),
    ...overrides
  };
}

/**
 * Create a mock conversation
 */
export function createMockConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: nanoid(),
    title: 'Test Conversation',
    messages: [
      createMockMessage({ role: 'user', content: 'Hello' }),
      createMockMessage({ role: 'assistant', content: 'Hi there! How can I help you today?' })
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    model: 'gpt-4',
    ...overrides
  };
}

/**
 * Create a mock attachment
 */
export function createMockAttachment(overrides: Partial<Attachment> = {}): Attachment {
  return {
    id: nanoid(),
    name: 'test-file.pdf',
    type: 'application/pdf',
    size: 12345,
    url: 'https://example.com/test-file.pdf',
    ...overrides
  };
}

/**
 * Create mock user settings
 */
export function createMockSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    profile: {
      name: 'Test User',
      email: 'test@example.com',
      ...overrides.profile
    },
    appearance: {
      theme: 'dark',
      language: 'en',
      fontSize: 16,
      reducedMotion: false,
      highContrast: false,
      ...overrides.appearance
    },
    privacy: {
      dataSharing: false,
      analyticsEnabled: false,
      historyEnabled: true,
      dataRetention: '90days',
      ...overrides.privacy
    },
    notifications: {
      enabled: true,
      type: 'all',
      sound: true,
      volume: 50,
      doNotDisturb: false,
      ...overrides.notifications
    },
    data: {
      autoSave: true,
      backupEnabled: false,
      backupFrequency: 'weekly',
      storageLimit: 1000,
      ...overrides.data
    },
    ai: {
      provider: 'openai',
      model: 'gpt-4',
      apiKey: '',
      temperature: 0.7,
      maxTokens: 2000,
      systemMessage: 'You are a helpful AI assistant.',
      streamResponses: true,
      embeddingModel: 'text-embedding-3-small',
      embeddingDimensions: 1536,
      embeddingQuality: 0.5,
      batchProcessing: false,
      ...overrides.ai
    }
  };
}