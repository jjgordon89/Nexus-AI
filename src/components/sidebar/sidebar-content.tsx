import React from 'react';
import { ConversationList } from '../chat/conversation-list';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarContentProps {
  isCollapsed: boolean;
  activeTab: 'chats' | 'documents' | 'settings' | 'help';
  setActiveTab: (tab: 'chats' | 'documents' | 'settings' | 'help') => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({ 
  isCollapsed, 
  activeTab 
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {activeTab === 'chats' && <ConversationList />}
            {activeTab === 'documents' && (
              <div className="p-4 text-sm text-muted-foreground">
                Document library will be available here.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};