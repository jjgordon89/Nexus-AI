# NexusAI Naming Conventions

This document outlines the standardized naming conventions to be used throughout the NexusAI codebase.
Following these conventions will improve code readability, maintainability, and consistency.

## File Naming

1. **Component Files**: Use kebab-case for component files
   - Example: `message-item.tsx`, `chat-input.tsx`

2. **Utility/Hook Files**: Use kebab-case for utility and hook files
   - Example: `use-debounce.ts`, `format-utils.ts`

3. **Type Files**: Use kebab-case for type definition files
   - Example: `message-types.ts`, `user-settings.ts`

4. **Store Files**: Use kebab-case for store files
   - Example: `app-store.ts`, `settings-store.ts`

## Component Naming

1. **React Components**: Use PascalCase for component names
   - Example: `MessageItem`, `ChatInput`

2. **Component Organization**:
   - Group related components in folders
   - Use an `index.tsx` file to export the main component from a folder
   - For component folders, use kebab-case (e.g., `message-item/`)

## Function Naming

1. **Regular Functions**: Use camelCase for function names
   - Example: `formatDate()`, `calculateTotal()`

2. **React Hooks**: Use camelCase with 'use' prefix
   - Example: `useAppStore()`, `useDebounce()`

3. **Event Handlers**: Use camelCase with 'handle' prefix
   - Example: `handleClick()`, `handleSubmit()`

## Variable Naming

1. **Regular Variables**: Use camelCase
   - Example: `userName`, `messageCount`

2. **Constants**: Use UPPER_SNAKE_CASE for true constants, camelCase for configuration objects
   - Example: `MAX_RETRY_COUNT`, `DEFAULT_SETTINGS`

3. **Boolean Variables**: Use 'is', 'has', or 'should' prefix
   - Example: `isLoading`, `hasError`, `shouldRefresh`

4. **Private Variables**: Use underscore prefix for truly private variables
   - Example: `_internalValue`

## Type/Interface Naming

1. **Interfaces/Types**: Use PascalCase
   - Example: `UserSettings`, `MessageProps`

2. **Enum Naming**: Use PascalCase for enum names, PascalCase for enum values
   - Example: `enum MessageStatus { Sent, Delivered, Read }`

## Import/Export Patterns

1. **Order of imports**:
   - React/framework imports first
   - Third-party library imports second
   - Local imports third
   - Type imports last

2. **Named vs Default Exports**:
   - Prefer named exports for utilities, hooks, and types
   - Use default exports for main components

## Documentation

1. **JSDoc Comments**: Use JSDoc format for function/component documentation
   - Example:
     ```typescript
     /**
      * Formats a date to a readable string
      * @param date The date to format
      * @returns Formatted date string
      */
     ```

2. **Code Comments**: Use // for single-line comments and /* */ for multi-line

Following these conventions will help maintain code quality and readability across the NexusAI codebase.