import { useState, useCallback } from 'react';
import { useAppStore } from '../../store/app-store';
import { useSettingsStore } from '../../store/settings-store';
import { useError } from '../../components/ui/error-provider';
import { useLoading } from '../../components/ui/loading-provider';
import { Message } from '../../types';
import { AIProviderFactory } from '../ai/factory';
import { AIError } from '../ai/error';

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const { handleError } = useError();
  const { showLoading, hideLoading } = useLoading();
  const { addMessage, isProcessingMessage } = useAppStore();
  const { settings } = useSettingsStore();

  const sendMessage = useCallback(async (content: string) => {
    if (isProcessingMessage || !content.trim()) return;

    try {
      const message: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      await addMessage(message);

      if (settings.ai.streamResponses) {
        setIsStreaming(true);
      } else {
        showLoading('Processing message...');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsStreaming(false);
      hideLoading();
    }
  }, [isProcessingMessage, addMessage, settings.ai.streamResponses, showLoading, hideLoading, handleError]);

  const abortMessage = useCallback(() => {
    setIsStreaming(false);
  }, []);

  return {
    sendMessage,
    abortMessage,
    isStreaming,
    isProcessingMessage,
  };
}