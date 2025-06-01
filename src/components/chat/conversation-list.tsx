import React from 'react';
import { useAppStore } from '../../store/app-store';
import { Button } from '../ui/button';
import { PlusIcon, MessageSquareTextIcon, TrashIcon } from 'lucide-react';
import { cn, truncateText } from '../../lib/utils';
import { motion } from 'framer-motion';

export const ConversationList: React.FC = () => {
  const { 
    conversations, 
    currentConversationId, 
    setCurrentConversation, 
    createNewConversation,
    deleteConversation
  } = useAppStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Button 
          variant="gradient" 
          className="w-full gap-2"
          onClick={createNewConversation}
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conversation) => {
          const isActive = conversation.id === currentConversationId;
          
          return (
            <motion.div 
              key={conversation.id}
              initial={false}
              whileHover={{ x: 4 }}
              className="mb-1 group"
            >
              <button
                onClick={() => setCurrentConversation(conversation.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 text-sm flex items-center gap-2 group/item transition-colors",
                  isActive 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <MessageSquareTextIcon className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">
                  {truncateText(conversation.title, 30)}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};