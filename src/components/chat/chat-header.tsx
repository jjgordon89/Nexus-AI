import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { TitleEditor } from './header/title-editor';
import { ExportMenu } from './header/export-menu';
import { ShareMenu } from './header/share-menu';
import { NewChatButton } from './header/new-chat-button';

export const ChatHeader: React.FC = () => {
  const { currentConversationId, conversations } = useAppStore();
  
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );
  
  if (!currentConversation) return null;
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <TitleEditor conversation={currentConversation} />
          
          <div className="flex items-center gap-2">
            <ShareMenu />
            <ExportMenu />
            <NewChatButton />
          </div>
        </div>
      </div>
    </header>
  );
};