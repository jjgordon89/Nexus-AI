import React, { useRef, useCallback, useState, useEffect } from 'react';
import { FixedSizeList, FixedSizeListProps } from 'react-window';
import { MessageItem } from './message-item';
import { Message } from '../../types';
import { Loading } from '../ui/loading';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../store/settings-store';

interface VirtualizedMessageListProps {
  messages: Message[];
  isProcessing: boolean;
}

/**
 * Component for displaying chat messages using virtualization for better performance
 * with large message lists
 */
export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  messages,
  isProcessing
}) => {
  const listRef = useRef<FixedSizeList>(null);
  const [estimatedItemHeight, setEstimatedItemHeight] = useState(150);
  const [listHeight, setListHeight] = useState(500);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettingsStore();
  const reducedMotion = settings.appearance.reducedMotion;

  // Measure container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.clientHeight);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
    }
  }, [messages.length]);

  // Estimate the appropriate height for each message
  // This is a simplified approach - in a production app, you might want
  // a more sophisticated measurement approach
  useEffect(() => {
    if (messages.length > 0) {
      // Roughly estimate based on content length
      const avgContentLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
      // Basic heuristic: longer content = taller item
      const newEstimatedHeight = Math.max(100, Math.min(300, 100 + avgContentLength / 10));
      setEstimatedItemHeight(newEstimatedHeight);
    }
  }, [messages]);

  // Render a single message item
  const renderMessage = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const message = messages[index];
    return (
      <div style={style}>
        <div className="mb-6">
          <MessageItem message={message} />
        </div>
      </div>
    );
  }, [messages]);

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <FixedSizeList
          ref={listRef}
          height={listHeight}
          width="100%"
          itemCount={messages.length}
          itemSize={estimatedItemHeight}
          overscanCount={3} // Render extra items for smoother scrolling
          className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {renderMessage}
        </FixedSizeList>
      )}
      
      {isProcessing && (
        <motion.div
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 mt-2"
        >
          <Loading text="AI is thinking..." />
        </motion.div>
      )}
    </div>
  );
};