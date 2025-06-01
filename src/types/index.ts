type MessageRole = 'user' | 'assistant' | 'system' | 'function';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'grok' | 'huggingface' | 'custom';
  isLocal: boolean;
}

interface APIProvider {
  name: string;
  key: string;
  baseUrl?: string;
  models: string[];
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultModel: string;
  enableLocalModels: boolean;
  enableHistory: boolean;
  maxHistoryLength: number;
}

interface VectorDBConfig {
  type: 'chroma' | 'milvus' | 'pinecone' | 'local';
  connectionString?: string;
  apiKey?: string;
  namespace?: string;
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string | null;
  preferences: UserPreferences;
  apiProviders: APIProvider[];
  isProcessingMessage: boolean;
  availableModels: AIModel[];
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  chunks?: number;
  vectorized?: boolean;
}