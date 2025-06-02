# State Management in NexusAI

## Overview

NexusAI uses Zustand for state management. Zustand provides a simple yet powerful way to create global state stores with minimal boilerplate. The application has two main stores:

1. **AppStore**: Manages conversations, messages, and application state
2. **SettingsStore**: Manages user preferences and settings

## AppStore

Located at `src/store/app-store.ts`, the AppStore manages:

- Conversations and their messages
- Current conversation selection
- Message processing state
- User preferences

### Key Features

#### Immutable Updates with Immer

AppStore uses Immer for immutable state updates, which makes the code more readable and maintainable:

```typescript
set(produce(state => {
  const conversation = state.conversations.find(
    conv => conv.id === state.currentConversationId
  );
  
  if (conversation) {
    conversation.messages.push(message);
    conversation.updatedAt = new Date();
  }
}));
```

#### Selectors for Performance

To prevent unnecessary re-renders, components use selectors to access only the state they need:

```typescript
// Only re-renders when currentConversationId changes
const currentConversationId = useAppStore(state => state.currentConversationId);

// Only re-renders when isProcessingMessage changes
const isProcessingMessage = useAppStore(state => state.isProcessingMessage);
```

#### Async Actions

The store includes async actions for handling operations like sending messages to AI providers:

```typescript
addMessage: async (message) => {
  // Validate message
  // Add to conversation
  // If user message, send to AI and add response
}
```

### Message Processing Flow

The message processing flow in AppStore:

1. User sends a message → `addMessage` action
2. Message is validated and added to the conversation
3. `isProcessingMessage` flag is set to true
4. Message is sent to the AI provider
5. AI response is received and added to the conversation
6. `isProcessingMessage` flag is set to false

## SettingsStore

Located at `src/store/settings-store.ts`, the SettingsStore manages:

- User profile information
- AI provider settings
- UI appearance preferences
- Privacy settings
- Notification preferences
- Data management settings

### Key Features

#### Persistent Storage

SettingsStore uses Zustand's persist middleware to save settings to localStorage:

```typescript
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'nexus-settings',
      version: 1,
    }
  )
);
```

#### Secure API Key Storage

API keys are stored securely using the `SecureStorage` utility:

```typescript
updateAISettings: (ai) => {
  const settings = {
    ...get().settings,
    ai: { ...get().settings.ai, ...ai },
  };
  
  // Store API key securely if present
  if (ai.apiKey) {
    secureStorage.setItem('api_key', ai.apiKey);
    // Remove API key from the state to avoid storing it in localStorage
    settings.ai.apiKey = '';
  }
  
  set({ settings });
}
```

## Component Integration

Components interact with the stores using hooks:

```typescript
function ChatComponent() {
  // Access state from AppStore
  const messages = useAppStore(state => 
    state.conversations.find(c => c.id === state.currentConversationId)?.messages || []
  );
  
  // Access state from SettingsStore
  const { theme } = useSettingsStore(state => state.settings.appearance);
  
  // Access actions from AppStore
  const { addMessage } = useAppStore();
  
  // Handler function
  const handleSend = (content) => {
    const message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    addMessage(message);
  };
  
  // Render component
}
```

## Custom Hooks

The application provides custom hooks to simplify state access:

- `useChat`: For chat-related functionality
- `useConversation`: For conversation management
- `useAppTheme`: For theme management

Example:

```typescript
function ChatInput() {
  const { sendMessage, isProcessing } = useChat();
  
  return (
    <form onSubmit={e => {
      e.preventDefault();
      sendMessage(inputValue);
    }}>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <button type="submit" disabled={isProcessing}>Send</button>
    </form>
  );
}
```

## State Update Flow

1. User interacts with the UI
2. Component calls store action
3. Action updates state (possibly after async operations)
4. Components with relevant selectors re-render
5. UI reflects the new state

## Best Practices

When working with the state management system:

1. Use selectors to minimize re-renders
2. Use Immer for complex state updates
3. Handle errors properly in async actions
4. Keep sensitive data out of the persisted state
5. Split large stores into logical domains
6. Use custom hooks to encapsulate store logic