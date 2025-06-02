import { create } from 'zustand';
import { generateSessionId } from '../lib/utils';
import { AppState, Conversation, Message } from '../types';
import { AIProviderFactory } from '../lib/ai/factory';
import { useSettingsStore } from './settings-store';
import { AIError } from '../lib/ai/error';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

const DEFAULT_CONVERSATION: Conversation = {
  id: generateSessionId(),
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
      id: generateSessionId(),
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
    // Validate message length
    if (message.content.length > MAX_MESSAGE_LENGTH) {
      throw new AIError(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`);
    }

    const state = get();
    const settings = useSettingsStore.getState().settings;
    const conversation = state.conversations.find(
      (conv) => conv.id === state.currentConversationId
    );

    if (!conversation) return;

    // Check message count
    if (conversation.messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
      throw new AIError(`Conversation has reached the maximum limit of ${MAX_MESSAGES_PER_CONVERSATION} messages`);
    }

    // Add user message
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === state.currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
            }
          : conv
      ),
    }));

    // If it's a user message, generate AI response
    if (message.role === 'user') {
      // Check rate limit
      if (!checkRateLimit()) {
        throw new AIError('Rate limit exceeded. Please wait before sending more messages.');
      }

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

        const response = await provider.chat({
          model: settings.ai.model,
          messages: [
            {
              role: 'system',
              content: settings.ai.systemMessage || 'You are a helpful AI assistant.',
            },
            ...conversation.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: message.role,
              content: message.content,
            }
          ],
          temperature: settings.ai.temperature,
          maxTokens: settings.ai.maxTokens,
          stream: settings.ai.streamResponses,
        });

        const aiMessage: Message = {
          id: generateSessionId(),
          role: 'assistant',
          content: response.message.content,
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, aiMessage],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      } catch (error) {
        const errorMessage = error instanceof AIError 
          ? error.message 
          : 'An error occurred while generating the response. Please try again.';

        const errorSystemMessage: Message = {
          id: generateSessionId(),
          role: 'system',
          content: errorMessage,
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === state.currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, errorSystemMessage],
                  updatedAt: new Date(),
                }
              : conv
          ),
        }));
      } finally {
        set({ isProcessingMessage: false });
      }
    }
  },

  updateMessage: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === state.currentConversationId
          ? {
              ...conv,
              messages: conv.messages.map((msg) =>
                msg.id === id ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date(),
            }
          : conv
      ),
    })),

  setIsProcessingMessage: (isProcessing) =>
    set({ isProcessingMessage: isProcessing }),

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
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === state.currentConversationId
          ? { ...conv, title }
          : conv
      ),
    })),

  clearMessages: () =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === state.currentConversationId
          ? { ...conv, messages: [] }
          : conv
      ),
    })),
}));