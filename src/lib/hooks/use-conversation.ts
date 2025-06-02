import { useCallback } from 'react';
import { useAppStore } from '../../store/app-store';
import { useError } from '../../components/ui/error-provider';
import { ConversationValidator } from '../validators';

/**
 * Custom hook for conversation management
 * Provides functions for creating, updating, and deleting conversations
 */
export function useConversation() {
  const { 
    conversations, 
    currentConversationId,
    createNewConversation,
    deleteConversation,
    updateCurrentConversationTitle,
  } = useAppStore();
  
  const { handleError } = useError();

  const currentConversation = conversations.find(
    conv => conv.id === currentConversationId
  );

  /**
   * Updates the title of the current conversation
   * @param title The new title to set
   */
  const updateTitle = useCallback(async (title: string) => {
    try {
      const validatedTitle = await ConversationValidator.parseAsync({ 
        title,
        model: currentConversation?.model || ''
      });
      updateCurrentConversationTitle(validatedTitle.title);
    } catch (error) {
      handleError(error);
    }
  }, [currentConversation, updateCurrentConversationTitle, handleError]);

  /**
   * Deletes the current conversation
   */
  const deleteCurrentConversation = useCallback(() => {
    if (currentConversationId) {
      deleteConversation(currentConversationId);
    }
  }, [currentConversationId, deleteConversation]);

  return {
    conversations,
    currentConversation,
    createNewConversation,
    deleteConversation: deleteCurrentConversation,
    updateTitle,
  };
}