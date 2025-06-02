export type MessageRole = 'user' | 'assistant' | 'system' | 'function';

/**
 * Represents a file attachment in a message
 */
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

/**
 * Represents a message in a conversation
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  isStreaming?: boolean;  // Property for streaming messages
  attachments?: Attachment[];
}

/**
 * Represents a conversation with messages
 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

/**
 * Represents an AI model configuration
 */
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'grok' | 'huggingface' | 'custom';
  isLocal: boolean;
}

/**
 * Represents an API provider configuration
 */
export interface APIProvider {
  name: string;
  key: string;
  baseUrl?: string;
  models: string[];
}

/**
 * User preferences for the application
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  enableLocalModels: boolean;
  enableHistory: boolean;
  maxHistoryLength: number;
}

/**
 * Vector database configuration
 */
export interface VectorDBConfig {
  type: 'chroma' | 'milvus' | 'pinecone' | 'local';
  connectionString?: string;
  apiKey?: string;
  namespace?: string;
}

/**
 * Main application state interface
 */
export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  preferences: UserPreferences;
  isProcessingMessage: boolean;
  documents: Document[];
}

/**
 * Document metadata interface
 */
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  chunks?: number;
  vectorized?: boolean;
}