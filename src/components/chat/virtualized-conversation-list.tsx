import React, { useRef, useCallback, useState, useEffect } from 'react';
import { FixedSizeList } from 'react-window';
import { Button } from '../ui/button';
import { PlusIcon, MessageSquareTextIcon, TrashIcon } from 'lucide-react';
import { cn, truncateText } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settings-store';
import { Conversation } from '../../types';

interface VirtualizedConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateNewConversation: () => void;
}

/**
 * Component for displaying conversation list using virtualization for better performance
 * with large conversation lists (50+ conversations)
 */
export const VirtualizedConversationList: React.FC<VirtualizedConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onCreateNewConversation
}) => {
  const listRef = useRef<FixedSizeList>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(400);
  const { settings } = useSettingsStore();
  const reducedMotion = settings.appearance.reducedMotion;

  // Fixed item height for conversations (simpler than messages)
  const ITEM_HEIGHT = 70;

  // Measure container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Account for the "New Chat" button section (approximately 80px)
        const availableHeight = containerRef.current.clientHeight - 80;
        setListHeight(Math.max(200, availableHeight));
      }
    };

    updateHeight();
    
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Scroll to active conversation when currentConversationId changes
  useEffect(() => {
    if (listRef.current && currentConversationId && conversations.length > 0) {
      const activeIndex = conversations.findIndex(conv => conv.id === currentConversationId);
      if (activeIndex !== -1) {
        listRef.current.scrollToItem(activeIndex, 'smart');
      }
    }
  }, [currentConversationId, conversations]);

  // Render a single conversation item
  const renderConversationItem = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const conversation = conversations[index];
    const isActive = conversation.id === currentConversationId;

    return (
      <div style={style} className="px-2">
        <motion.div 
          key={conversation.id}
          initial={false}
          whileHover={reducedMotion ? {} : { x: 4 }}
          className="mb-1 group"
        >
          <button
            onClick={() => onSelectConversation(conversation.id)}
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
                onDeleteConversation(conversation.id);
              }}
              aria-label={`Delete conversation: ${conversation.title}`}
            >
              <TrashIcon className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </button>
        </motion.div>
      </div>
    );
  }, [conversations, currentConversationId, onSelectConversation, onDeleteConversation, reducedMotion]);

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* New Chat Button - Not virtualized */}
      <div className="p-4">
        <Button 
          variant="gradient" 
          className="w-full gap-2"
          onClick={onCreateNewConversation}
        >
          <PlusIcon className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      {/* Virtualized Conversation List */}
      <div className="flex-1 overflow-hidden">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground px-4">
            <p className="text-center text-sm">
              No conversations yet. Start by creating a new chat!
            </p>
          </div>
        ) : (
          <FixedSizeList
            ref={listRef}
            height={listHeight}
            width="100%"
            itemCount={conversations.length}
            itemSize={ITEM_HEIGHT}
            overscanCount={5} // Render extra items for smoother scrolling
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          >
            {renderConversationItem}
          </FixedSizeList>
        )}
      </div>
    </div>
  );
};