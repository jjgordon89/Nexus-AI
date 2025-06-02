import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '../../store/app-store';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ChatHeader } from './chat-header';
import { EmptyState } from './empty-state';
import { Message, Attachment } from '../../types';
import { FileHandler } from '../../lib/file-handler';
import { nanoid } from 'nanoid';

export const ChatContainer: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    currentConversationId, 
    conversations, 
    addMessage,
    isProcessingMessage 
  } = useAppStore(state => ({
    currentConversationId: state.currentConversationId,
    conversations: state.conversations,
    addMessage: state.addMessage,
    isProcessingMessage: state.isProcessingMessage
  }));
  
  const currentConversation = useMemo(() => 
    conversations.find(conv => conv.id === currentConversationId),
    [conversations, currentConversationId]
  );
  
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages?.length, scrollToBottom]);

  const handleSendMessage = useCallback(async (content: string, files?: File[]) => {
    if ((!content.trim() && (!files || files.length === 0)) || !currentConversation) return;

    let attachments: Attachment[] | undefined;
    let enhancedContent = content;

    // Process file attachments if present
    if (files && files.length > 0) {
      attachments = [];
      
      try {
        // Process each file
        for (const file of files) {
          const attachment = await FileHandler.createAttachment(file);
          attachments.push(attachment);
          
          // Extract content from files
          const fileContent = await FileHandler.extractContent(file);
          if (fileContent) {
            // Truncate content to avoid performance issues with very large files
            const maxContentLength = 2000;
            const truncatedContent = fileContent.length > maxContentLength 
              ? fileContent.substring(0, maxContentLength) + '...(content truncated)'
              : fileContent;
              
            enhancedContent += `\n\n**Content from ${file.name}:**\n\`\`\`\n${truncatedContent}\n\`\`\``;
          }
        }
      } catch (error) {
        console.error('Failed to process attachments:', error);
      }
    }

    const message: Message = {
      id: nanoid(),
      role: 'user',
      content: enhancedContent.trim(),
      timestamp: new Date(),
      attachments
    };

    try {
      await addMessage(message);
    } catch (error) {
      // Error is handled by the store's error handling
      console.error('Failed to send message:', error);
    }
  }, [currentConversation, addMessage]);

  // Don't render anything if no conversation is selected
  if (!currentConversation) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-screen pt-14 ml-16 md:ml-64">
      <ChatHeader />
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/50">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <ChatMessages 
            messages={currentConversation.messages} 
            isProcessing={isProcessingMessage} 
          />
          <div ref={messagesEndRef} />
        </div>
      </main>
      
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessingMessage} />
    </div>
  );
};