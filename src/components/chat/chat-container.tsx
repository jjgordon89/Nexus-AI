import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../../store/app-store';
import { MessageItem } from './message-item';
import { ChatInput } from './chat-input';
import { ChatHeader } from './chat-header';
import { motion, AnimatePresence } from 'framer-motion';
import { Loading } from '../ui/loading';
import { Message } from '../../types';

export const ChatContainer: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    currentConversationId, 
    conversations, 
    addMessage,
    isProcessingMessage 
  } = useAppStore();
  
  const currentConversation = useMemo(() => 
    conversations.find(conv => conv.id === currentConversationId),
    [conversations, currentConversationId]
  );
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation) return;

    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    try {
      await addMessage(message);
    } catch (error) {
      // Error is now handled by the store's error handling
      console.error('Failed to send message:', error);
    }
  };

  if (!currentConversation) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-muted-foreground">
        <p>Select or start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pt-14 ml-16 md:ml-64">
      <ChatHeader />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="popLayout">
            {currentConversation.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <MessageItem message={message} />
              </motion.div>
            ))}
            
            {isProcessingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4"
              >
                <Loading text="AI is thinking..." />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessingMessage} />
    </div>
  );
};