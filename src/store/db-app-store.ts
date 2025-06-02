/**
 * Database-backed application store
 * 
 * This store provides the same API as the original app-store, but uses
 * the database for persistent storage instead of just keeping state in memory.
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { produce } from 'immer';
import { Message, Conversation, AppState } from '../types';
import { AIError } from '../lib/ai/error';
import { AIErrorHandler } from '../lib/ai/error-handler';
import { MessageValidator } from '../lib/validators';
import { z } from 'zod';
import { 
  ConversationRepository,
  MessageRepository
} from '../lib/db';

// Default user ID for demo purposes (in a real app, this would come from authentication)
const DEFAULT_USER_ID = 'demo-user';

/**
 * Constants for app store configuration
 */
const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Default conversation when starting the app
 */
const DEFAULT_CONVERSATION: Conversation = {
  id: nanoid(),
  title: 'New Conversation',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  model: 'gpt-4',
};

/**
 * Interface for tracking rate limiting
 */
interface RateLimitInfo {
  timestamp: number;
  count: number;
}

/**
 * Rate limit tracking
 */
let rateLimitInfo: RateLimitInfo = {
  timestamp: Date.now(),
  count: 0,
};

/**
 * Check if the current request would exceed rate limits
 * Resets counter when window changes
 * 
 * @returns Boolean indicating if request is allowed
 */
const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitInfo = { timestamp: now, count: 0 };
  }
  return rateLimitInfo.count < MAX_REQUESTS_PER_WINDOW;
};

/**
 * Increment the rate limit counter
 */
const incrementRateLimit = () => {
  rateLimitInfo.count++;
};

/**
 * Sanitizes message content by removing HTML tags and normalizing whitespace
 * Used as a security measure to prevent injection attacks
 * 
 * @param content - The message content to sanitize
 * @returns Sanitized string
 */
const sanitizeContent = (content: string): string => {
  // Basic sanitization: strip HTML tags, trim, and normalize whitespace
  return content
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Main application state store using Zustand with database persistence
 * 
 * This store has the same API as the original app-store, but uses
 * the database for persistent storage.
 */
export const useDBAppStore = create<AppState & {
  setCurrentConversation: (id: string) => void;
  createNewConversation: () => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  setIsProcessingMessage: (isProcessing: boolean) => void;
  deleteConversation: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  updateCurrentConversationTitle: (title: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  loadConversations: () => Promise<void>;
}>((set, get) => ({
  conversations: [DEFAULT_CONVERSATION],
  currentConversationId: DEFAULT_CONVERSATION.id,
  preferences: {
    theme: 'dark',
    defaultModel: 'gpt-4',
    enableLocalModels: true,
    enableHistory: true,
    maxHistoryLength: 100,
  },
  isProcessingMessage: false,
  documents: [],

  /**
   * Load all conversations for the current user
   */
  loadConversations: async () => {
    try {
      // Get all conversations for the demo user
      const conversations = await ConversationRepository.findByUserId(DEFAULT_USER_ID);
      
      // If no conversations found, create a default one
      if (conversations.length === 0) {
        const defaultConv = await ConversationRepository.create(DEFAULT_USER_ID, {
          title: DEFAULT_CONVERSATION.title,
          model: DEFAULT_CONVERSATION.model,
        });
        
        set({ 
          conversations: [{
            id: defaultConv.id,
            title: defaultConv.title,
            model: defaultConv.model,
            createdAt: new Date(defaultConv.created_at),
            updatedAt: new Date(defaultConv.updated_at),
            messages: [],
          }],
          currentConversationId: defaultConv.id,
        });
        return;
      }
      
      // Load each conversation with its messages
      const fullConversations: Conversation[] = [];
      
      for (const conv of conversations) {
        const fullConversation = await ConversationRepository.getWithMessages(conv.id);
        if (fullConversation) {
          fullConversations.push(fullConversation);
        }
      }
      
      set({
        conversations: fullConversations,
        currentConversationId: fullConversations[0]?.id || null,
      });
      
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Fall back to default conversation if loading fails
      set({
        conversations: [DEFAULT_CONVERSATION],
        currentConversationId: DEFAULT_CONVERSATION.id,
      });
    }
  },

  /**
   * Sets the current active conversation
   * @param id - ID of the conversation to set as current
   */
  setCurrentConversation: (id) => 
    set({ currentConversationId: id }),

  /**
   * Creates a new conversation and sets it as the current one
   */
  createNewConversation: async () => {
    try {
      const newConversationRecord = await ConversationRepository.create(DEFAULT_USER_ID, {
        title: 'New Conversation',
        model: get().preferences.defaultModel,
      });
      
      const newConversation: Conversation = {
        id: newConversationRecord.id,
        title: newConversationRecord.title,
        messages: [],
        createdAt: new Date(newConversationRecord.created_at),
        updatedAt: new Date(newConversationRecord.updated_at),
        model: newConversationRecord.model,
      };
      
      set(produce(state => {
        state.conversations.push(newConversation);
        state.currentConversationId = newConversation.id;
      }));
    } catch (error) {
      console.error('Failed to create new conversation:', error);
      throw new AIError('Failed to create new conversation');
    }
  },

  /**
   * Adds a message to the current conversation
   * If it's a user message, also generates an AI response
   * 
   * This function implements the core message flow:
   * 1. Validate the user message
   * 2. Add the user message to the conversation
   * 3. If it's a user message, send it to the AI provider
   * 4. Handle streaming if enabled
   * 5. Add the AI response to the conversation
   * 
   * @param message - The message to add
   */
  addMessage: async (message) => {
    try {
      // Step 1: Validate the message
      const validatedMessage = await validateMessage(message);
      
      // Step 2: Check rate limiting
      if (!checkRateLimit()) {
        throw new AIError('Rate limit exceeded. Please wait before sending more messages.');
      }

      const state = get();
      const conversationId = state.currentConversationId;
      
      if (!conversationId) {
        throw new AIError('No conversation selected');
      }
      
      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );

      if (!conversation) {
        throw new AIError('Conversation not found');
      }

      // Step 3: Check message count limit
      if (conversation.messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
        throw new AIError(`Conversation has reached the maximum limit of ${MAX_MESSAGES_PER_CONVERSATION} messages`);
      }

      // Step 4: Add user message to the conversation in database
      const savedMessage = await ConversationRepository.addMessage(conversationId, validatedMessage);

      // Update local state
      set(produce(state => {
        const conversation = state.conversations.find(
          (conv) => conv.id === state.currentConversationId
        );
        
        if (conversation) {
          conversation.messages.push(savedMessage);
          conversation.updatedAt = new Date();
        }
      }));

      // Step 5: If it's a user message, generate AI response
      if (validatedMessage.role === 'user') {
        set({ isProcessingMessage: true });

        try {
          // Dynamically import the AI factory to reduce initial bundle size
          const { AIProviderFactory } = await import('../lib/ai/factory');
          const { useSettingsStore } = await import('../store/settings-store');
          
          // Get secure API key
          const apiKey = useSettingsStore.getState().getSecureApiKey();
          const settings = useSettingsStore.getState().settings;
          
          if (!apiKey) {
            throw new AIError('API key is required. Please configure it in settings.');
          }

          const provider = await AIProviderFactory.createProvider(
            settings.ai.provider,
            apiKey,
            settings.ai.baseUrl
          );

          incrementRateLimit();

          // Get the latest conversation state after user message was added
          const updatedState = get();
          const updatedConversation = updatedState.conversations.find(
            (conv) => conv.id === updatedState.currentConversationId
          );
          
          if (!updatedConversation) {
            throw new AIError('Conversation not found');
          }

          // Step 6: Send the message to AI provider with system message
          const response = await provider.chat({
            model: settings.ai.model,
            messages: [
              {
                role: 'system',
                content: settings.ai.systemMessage || 'You are a helpful AI assistant.',
              },
              ...updatedConversation.messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
            temperature: settings.ai.temperature,
            maxTokens: settings.ai.maxTokens,
            stream: settings.ai.streamResponses,
            onToken: settings.ai.streamResponses ? (token) => {
              // If streaming is enabled, update the partial response
              set(produce(state => {
                const conversation = state.conversations.find(
                  conv => conv.id === state.currentConversationId
                );
                
                // Find or create a streaming message
                let streamingMessage = conversation?.messages.find(
                  msg => msg.isStreaming === true && msg.role === 'assistant'
                );
                
                if (!streamingMessage && conversation) {
                  // Create a new streaming message
                  streamingMessage = {
                    id: nanoid(),
                    role: 'assistant',
                    content: token,
                    timestamp: new Date(),
                    isStreaming: true
                  };
                  conversation.messages.push(streamingMessage);
                } else if (streamingMessage) {
                  // Update existing streaming message
                  streamingMessage.content += token;
                }
              }));
            } : undefined
          });

          // Step 7: Create AI response message
          const aiMessage: Message = {
            id: nanoid(),
            role: 'assistant',
            content: response.message.content,
            timestamp: new Date(),
          };

          // Save AI response to database
          const savedAiMessage = await ConversationRepository.addMessage(
            conversationId, 
            aiMessage
          );

          // Step 8: Add AI response to conversation in local state
          set(produce(state => {
            const conversation = state.conversations.find(
              conv => conv.id === state.currentConversationId
            );
            
            if (conversation) {
              // If we were streaming, remove the streaming message
              if (settings.ai.streamResponses) {
                const streamingIndex = conversation.messages.findIndex(
                  msg => msg.isStreaming === true && msg.role === 'assistant'
                );
                
                if (streamingIndex >= 0) {
                  conversation.messages.splice(streamingIndex, 1);
                }
              }
              
              conversation.messages.push(savedAiMessage);
              conversation.updatedAt = new Date();
            }
          }));
        } catch (error) {
          // Use the enhanced error handler
          const aiError = AIErrorHandler.handleError(error);
          
          const errorSystemMessage: Message = {
            id: nanoid(),
            role: 'system',
            content: aiError.message,
            timestamp: new Date(),
          };

          // Save error message to database
          await ConversationRepository.addMessage(conversationId, errorSystemMessage);

          // Update state with error message
          set(produce(state => {
            const conversation = state.conversations.find(
              conv => conv.id === state.currentConversationId
            );
            
            if (conversation) {
              conversation.messages.push(errorSystemMessage);
              conversation.updatedAt = new Date();
            }
          }));
        } finally {
          set({ isProcessingMessage: false });
        }
      }
    } catch (error) {
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => e.message).join(', ');
        throw new AIError(errorMessage);
      } else if (error instanceof AIError) {
        throw error;
      } else {
        throw new AIError('An error occurred while processing your message');
      }
    }
  },

  /**
   * Updates an existing message in the current conversation
   * 
   * @param id - ID of the message to update
   * @param updates - Partial Message object with updates to apply
   */
  updateMessage: async (id, updates) => {
    try {
      // Update message in the database
      await MessageRepository.update(id, updates);
      
      // Update message in the local state
      set(produce(state => {
        const conversation = state.conversations.find(
          conv => conv.id === state.currentConversationId
        );
        
        if (!conversation) return;
        
        const message = conversation.messages.find(msg => msg.id === id);
        
        if (message) {
          Object.assign(message, updates);
          conversation.updatedAt = new Date();
        }
      }));
    } catch (error) {
      console.error('Failed to update message:', error);
      throw new AIError('Failed to update message');
    }
  },

  /**
   * Sets the isProcessingMessage flag to indicate AI is processing
   * 
   * @param isProcessing - Boolean indicating if a message is being processed
   */
  setIsProcessingMessage: (isProcessing) =>
    set({ isProcessingMessage }),

  /**
   * Deletes a conversation by ID
   * If the deleted conversation is the current one, switches to another conversation
   * 
   * @param id - ID of the conversation to delete
   */
  deleteConversation: async (id) => {
    try {
      // Delete the conversation from the database
      await ConversationRepository.delete(id);
      
      // Update the local state
      set(produce(state => {
        const index = state.conversations.findIndex(conv => conv.id === id);
        
        if (index !== -1) {
          state.conversations.splice(index, 1);
          
          // If deleted conversation was the current one, select another
          if (id === state.currentConversationId) {
            state.currentConversationId = state.conversations[0]?.id || null;
          }
        }
      }));
      
      // If we have no conversations left, create a new one
      const { conversations } = get();
      if (conversations.length === 0) {
        await get().createNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw new AIError('Failed to delete conversation');
    }
  },

  /**
   * Updates user preferences
   * 
   * @param preferences - Partial preferences object with changes
   */
  updatePreferences: (preferences) =>
    set(produce(state => {
      Object.assign(state.preferences, preferences);
    })),

  /**
   * Updates the title of the current conversation
   * 
   * @param title - New title for the conversation
   */
  updateCurrentConversationTitle: async (title) => {
    const { currentConversationId } = get();
    
    if (!currentConversationId) {
      throw new AIError('No conversation selected');
    }
    
    try {
      // Update the conversation in the database
      await ConversationRepository.update(currentConversationId, { title });
      
      // Update the local state
      set(produce(state => {
        const conversation = state.conversations.find(
          conv => conv.id === state.currentConversationId
        );
        
        if (conversation) {
          conversation.title = title;
        }
      }));
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      throw new AIError('Failed to update conversation title');
    }
  },

  /**
   * Clears all messages from the current conversation
   */
  clearMessages: async () => {
    const { currentConversationId } = get();
    
    if (!currentConversationId) {
      throw new AIError('No conversation selected');
    }
    
    try {
      // In a real implementation, you would delete all messages from the database
      // Here we'll create a new conversation with the same title
      const currentConversation = get().conversations.find(
        conv => conv.id === currentConversationId
      );
      
      if (!currentConversation) {
        throw new AIError('Conversation not found');
      }
      
      // Delete the old conversation
      await ConversationRepository.delete(currentConversationId);
      
      // Create a new conversation with the same title
      const newConversationRecord = await ConversationRepository.create(DEFAULT_USER_ID, {
        title: currentConversation.title,
        model: currentConversation.model,
      });
      
      const newConversation: Conversation = {
        id: newConversationRecord.id,
        title: newConversationRecord.title,
        messages: [],
        createdAt: new Date(newConversationRecord.created_at),
        updatedAt: new Date(newConversationRecord.updated_at),
        model: newConversationRecord.model,
      };
      
      // Update the state
      set(produce(state => {
        // Remove the old conversation
        const index = state.conversations.findIndex(
          conv => conv.id === currentConversationId
        );
        
        if (index !== -1) {
          state.conversations.splice(index, 1, newConversation);
        } else {
          state.conversations.push(newConversation);
        }
        
        state.currentConversationId = newConversation.id;
      }));
    } catch (error) {
      console.error('Failed to clear messages:', error);
      throw new AIError('Failed to clear messages');
    }
  },
}));

/**
 * Validates and sanitizes a message
 * 
 * @param message - The message to validate
 * @returns Promise resolving to the validated and sanitized message
 * @throws AIError if validation fails
 */
async function validateMessage(message: Message): Promise<Message> {
  try {
    // First, sanitize the content
    const sanitizedContent = sanitizeContent(message.content);
    
    // Then validate with Zod schema
    await MessageValidator.parseAsync({
      content: sanitizedContent,
      attachments: message.attachments
    });
    
    // Return a validated and sanitized message
    return {
      ...message,
      content: sanitizedContent
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      throw new AIError(errorMessage);
    }
    throw error;
  }
}