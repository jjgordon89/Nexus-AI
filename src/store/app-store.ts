import { create } from 'zustand';
import { generateSessionId } from '../lib/utils';
import { AppState, Conversation, Message } from '../types';
import { AIProviderFactory } from '../lib/ai/factory';
import { useSettingsStore } from './settings-store';
import { AIError } from '../lib/ai/error';
import { AIErrorHandler } from '../lib/ai/error-handler';
import { nanoid } from 'nanoid';
import { produce } from 'immer';
import { MessageValidator } from '../lib/validators';
import { z } from 'zod';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

const DEFAULT_CONVERSATION: Conversation = {
  id: nanoid(),
  title: 'New Conversation',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  model: 'gpt-4',
};

interface RateLimitInfo {
  timestamp: number;
  count: number;
}

let rateLimitInfo: RateLimitInfo = {
  timestamp: Date.now(),
  count: 0,
};

const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitInfo = { timestamp: now, count: 0 };
  }
  return rateLimitInfo.count < MAX_REQUESTS_PER_WINDOW;
};

const incrementRateLimit = () => {
  rateLimitInfo.count++;
};

// Helper function to sanitize message content
const sanitizeContent = (content: string): string => {
  // Basic sanitization: strip HTML tags, trim, and normalize whitespace
  return content
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .trim()
    .replace(/\s+/g, ' ');
};

export const useAppStore = create<AppState & {
  setCurrentConversation: (id: string) => void;
  createNewConversation: () => void;
  addMessage: (message: Message) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setIsProcessingMessage: (isProcessing: boolean) => void;
  deleteConversation: (id: string) => void;
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void;
  updateCurrentConversationTitle: (title: string) => void;
  clearMessages: () => void;
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

  setCurrentConversation: (id) => 
    set({ currentConversationId: id }),

  createNewConversation: () => {
    const newConversation: Conversation = {
      id: nanoid(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: useSettingsStore.getState().settings.ai.model,
    };

    set((state) => ({
      conversations: [...state.conversations, newConversation],
      currentConversationId: newConversation.id,
    }));
  },

  addMessage: async (message) => {
    try {
      // Step 1: Validate the message
      const validatedMessage = await validateMessage(message);
      
      // Step 2: Check rate limiting
      if (!checkRateLimit()) {
        throw new AIError('Rate limit exceeded. Please wait before sending more messages.');
      }

      const state = get();
      const settings = useSettingsStore.getState().settings;
      const conversation = state.conversations.find(
        (conv) => conv.id === state.currentConversationId
      );

      if (!conversation) {
        throw new AIError('Conversation not found');
      }

      // Step 3: Check message count limit
      if (conversation.messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
        throw new AIError(`Conversation has reached the maximum limit of ${MAX_MESSAGES_PER_CONVERSATION} messages`);
      }

      // Step 4: Add user message to the conversation
      set((state) => {
        const convIndex = state.conversations.findIndex(
          (conv) => conv.id === state.currentConversationId
        );
        
        if (convIndex === -1) return state;
        
        const updatedConversations = [...state.conversations];
        updatedConversations[convIndex] = {
          ...updatedConversations[convIndex],
          messages: [...updatedConversations[convIndex].messages, validatedMessage],
          updatedAt: new Date(),
        };
        
        return { conversations: updatedConversations };
      });

      // Step 5: If it's a user message, generate AI response
      if (validatedMessage.role === 'user') {
        set({ isProcessingMessage: true });

        try {
          // Get secure API key
          const apiKey = useSettingsStore.getState().getSecureApiKey();
          
          if (!apiKey) {
            throw new AIError('API key is required. Please configure it in settings.');
          }

          const provider = AIProviderFactory.createProvider(
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
          });

          // Step 7: Create AI response message
          const aiMessage: Message = {
            id: nanoid(),
            role: 'assistant',
            content: response.message.content,
            timestamp: new Date(),
          };

          // Step 8: Add AI response to conversation
          set((state) => {
            const convIndex = state.conversations.findIndex(
              (conv) => conv.id === state.currentConversationId
            );
            
            if (convIndex === -1) return state;
            
            const updatedConversations = [...state.conversations];
            updatedConversations[convIndex] = {
              ...updatedConversations[convIndex],
              messages: [...updatedConversations[convIndex].messages, aiMessage],
              updatedAt: new Date(),
            };
            
            return { conversations: updatedConversations };
          });
        } catch (error) {
          // Use the enhanced error handler
          const aiError = AIErrorHandler.handleError(error);
          
          const errorSystemMessage: Message = {
            id: nanoid(),
            role: 'system',
            content: aiError.message,
            timestamp: new Date(),
          };

          // Update state with error message
          set((state) => {
            const convIndex = state.conversations.findIndex(
              (conv) => conv.id === state.currentConversationId
            );
            
            if (convIndex === -1) return state;
            
            const updatedConversations = [...state.conversations];
            updatedConversations[convIndex] = {
              ...updatedConversations[convIndex],
              messages: [...updatedConversations[convIndex].messages, errorSystemMessage],
              updatedAt: new Date(),
            };
            
            return { conversations: updatedConversations };
          });
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

  updateMessage: (id, updates) =>
    set((state) => {
      const convIndex = state.conversations.findIndex(
        (conv) => conv.id === state.currentConversationId
      );
      
      if (convIndex === -1) return state;
      
      const updatedConversations = [...state.conversations];
      const msgIndex = updatedConversations[convIndex].messages.findIndex(
        (msg) => msg.id === id
      );
      
      if (msgIndex === -1) return state;
      
      // Create a new messages array with the updated message
      const updatedMessages = [...updatedConversations[convIndex].messages];
      updatedMessages[msgIndex] = {
        ...updatedMessages[msgIndex],
        ...updates
      };
      
      // Update the conversation with the new messages array
      updatedConversations[convIndex] = {
        ...updatedConversations[convIndex],
        messages: updatedMessages,
        updatedAt: new Date(),
      };
      
      return { conversations: updatedConversations };
    }),

  setIsProcessingMessage: (isProcessing) =>
    set({ isProcessingMessage }),

  deleteConversation: (id) =>
    set((state) => {
      const filteredConversations = state.conversations.filter(
        (conv) => conv.id !== id
      );
      
      return {
        conversations: filteredConversations,
        currentConversationId:
          id === state.currentConversationId
            ? filteredConversations[0]?.id || null
            : state.currentConversationId,
      };
    }),

  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        ...preferences,
      },
    })),

  updateCurrentConversationTitle: (title) =>
    set((state) => {
      const convIndex = state.conversations.findIndex(
        (conv) => conv.id === state.currentConversationId
      );
      
      if (convIndex === -1) return state;
      
      const updatedConversations = [...state.conversations];
      updatedConversations[convIndex] = {
        ...updatedConversations[convIndex],
        title
      };
      
      return { conversations: updatedConversations };
    }),

  clearMessages: () =>
    set((state) => {
      const convIndex = state.conversations.findIndex(
        (conv) => conv.id === state.currentConversationId
      );
      
      if (convIndex === -1) return state;
      
      const updatedConversations = [...state.conversations];
      updatedConversations[convIndex] = {
        ...updatedConversations[convIndex],
        messages: []
      };
      
      return { conversations: updatedConversations };
    }),
}));

// Validate and sanitize the message
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