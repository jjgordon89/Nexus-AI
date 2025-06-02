export type MessageRole = 'user' | 'assistant' | 'system' | 'function';

/**
 * Represents a file attachment in a message
 * Attachments can be text files, PDFs, or other supported document types
 */
export interface Attachment {
  id: string;             // Unique identifier
  name: string;           // File name
  type: string;           // MIME type
  size: number;           // File size in bytes
  url?: string;           // URL to access the file (blob URL for local files)
}

/**
 * Represents a message in a conversation
 * Messages can be from the user, assistant, or system
 */
export interface Message {
  id: string;             // Unique identifier
  role: MessageRole;      // Who the message is from (user, assistant, system)
  content: string;        // The actual message content
  timestamp: Date;        // When the message was created
  isThinking?: boolean;   // Flag for "thinking" state during processing
  isStreaming?: boolean;  // Flag for streaming messages that are still receiving content
  attachments?: Attachment[]; // Optional file attachments
}

/**
 * Represents a conversation with messages
 * A conversation is a collection of messages between the user and the AI
 */
export interface Conversation {
  id: string;             // Unique identifier
  title: string;          // Conversation title
  messages: Message[];    // Array of messages in the conversation
  createdAt: Date;        // When the conversation was created
  updatedAt: Date;        // When the conversation was last updated
  model: string;          // The AI model used for the conversation
}

/**
 * Represents an AI model configuration
 */
export interface AIModel {
  id: string;             // Model identifier
  name: string;           // Display name
  provider: 'openai' | 'anthropic' | 'ollama' | 'grok' | 'huggingface' | 'custom'; // Who provides the model
  isLocal: boolean;       // Whether the model runs locally
}

/**
 * Represents an API provider configuration
 */
export interface APIProvider {
  name: string;           // Provider name
  key: string;            // API key identifier
  baseUrl?: string;       // Optional custom API endpoint
  models: string[];       // Available models
}

/**
 * User preferences for the application
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'; // UI theme
  defaultModel: string;               // Default AI model
  enableLocalModels: boolean;         // Whether local models are enabled
  enableHistory: boolean;             // Whether to keep conversation history
  maxHistoryLength: number;           // Max number of conversations to keep
}

/**
 * Vector database configuration
 */
export interface VectorDBConfig {
  type: 'chroma' | 'milvus' | 'pinecone' | 'local'; // Type of vector database
  connectionString?: string;                        // Connection URL
  apiKey?: string;                                  // API key if needed
  namespace?: string;                               // Namespace within the DB
}

/**
 * Main application state interface
 * This is the root state managed by Zustand
 */
export interface AppState {
  conversations: Conversation[];          // All conversations
  currentConversationId: string | null;   // Currently active conversation
  preferences: UserPreferences;           // User preferences
  isProcessingMessage: boolean;           // Whether an AI message is being processed
  documents: Document[];                  // Stored documents
}

/**
 * Document metadata interface
 * Represents a document stored in the system
 */
export interface Document {
  id: string;             // Unique identifier
  name: string;           // Document name
  type: string;           // Document type
  size: number;           // Size in bytes
  uploadedAt: Date;       // When the document was uploaded
  chunks?: number;        // Number of chunks for embedding
  vectorized?: boolean;   // Whether the document has been converted to vectors
}