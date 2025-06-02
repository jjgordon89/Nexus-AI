# NexusAI Developer Documentation

Welcome to the NexusAI developer documentation. This guide will help you understand the codebase, architecture, and how to contribute to the project.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [Naming Conventions](../src/lib/naming-convention.md)
3. [Component Documentation](#component-documentation)
4. [State Management](#state-management)
5. [AI Provider System](#ai-provider-system)
6. [File Handling](#file-handling)
7. [Error Handling](#error-handling)
8. [Code Organization](#code-organization)

## Component Documentation

NexusAI is built with React and follows a component-based architecture. Components are organized into logical groups:

- **Chat Components**: Message display, input, conversation management
- **Settings Components**: User preferences, AI configuration, appearance settings
- **UI Components**: Reusable UI elements like buttons, inputs, and dialogs
- **Layout Components**: App structure, sidebar, and navigation

Each component is designed to be modular and reusable. For details on specific components, see their corresponding files in the `src/components` directory.

## State Management

The application uses Zustand for state management, with two primary stores:

- **AppStore** (`src/store/app-store.ts`): Manages conversations, messages, and application state
- **SettingsStore** (`src/store/settings-store.ts`): Handles user preferences and settings

The state management follows these principles:

- Immutable updates (using Immer)
- Selector functions to minimize re-renders
- Async actions for API interactions
- Persistent storage for settings

## AI Provider System

NexusAI supports multiple AI providers through a unified interface. The system is structured as follows:

- **AIProvider Interface** (`src/lib/ai/types.ts`): Common interface for all providers
- **BaseAIProvider** (`src/lib/ai/base-provider.ts`): Abstract base class with shared functionality
- **Provider Implementations** (`src/lib/ai/providers/`): Provider-specific implementations
- **Factory** (`src/lib/ai/factory.ts`): Creates appropriate provider instances

To add a new AI provider:

1. Create a new provider class that extends `BaseAIProvider`
2. Implement the required methods
3. Add the provider to the factory

## File Handling

NexusAI supports file attachments with these components:

- **FileHandler** (`src/lib/file-handler.ts`): Core file operations
- **DocumentProcessor** (`src/lib/document-processor.ts`): Content extraction from various file types
- **File Components** (`src/components/chat/file-attachment.tsx`): UI for file attachments

The system supports:
- PDF files (using PDF.js)
- Word documents (using mammoth.js)
- Text files
- CSV files
- JSON files

## Error Handling

Error handling is centralized for consistency:

- **AIError** (`src/lib/ai/error.ts`): Custom error class
- **AIErrorHandler** (`src/lib/ai/error-handler.ts`): Error categorization and user messages
- **Error Boundaries** (`src/components/error-boundary.tsx`): React error boundaries
- **UI Error Display**: Standardized error toast notifications

## Code Organization

The codebase is organized into these main directories:

```
src/
├── components/    # React components
├── lib/           # Utility functions and services
├── store/         # State management
├── types/         # TypeScript type definitions
├── hooks/         # React hooks (redirects to lib/hooks)
├── App.tsx        # Main app component
└── main.tsx      # Application entry point
```

Best practices:
- Keep components focused and small
- Extract shared logic into hooks or utilities
- Use lazy loading for large components
- Add JSDoc comments for complex functions