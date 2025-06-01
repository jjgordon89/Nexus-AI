import { useCallback } from 'react';
import { useAppStore } from '../../store/app-store';
import { useError } from '../../components/ui/error-provider';
import { ConversationValidator } from '../validators';

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