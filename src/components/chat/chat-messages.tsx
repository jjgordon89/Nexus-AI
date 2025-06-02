import React, { useMemo } from 'react';
import { MessageItem } from './message-item';
import { Loading } from '../ui/loading';
import { Message } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

// Memoized MessageItem to prevent unnecessary re-renders
const MemoizedMessageItem = React.memo(MessageItem);

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
}

/**
 * Component for displaying chat messages with animations
 */
export const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({ messages, isProcessing }) => {
  // Use useMemo to avoid recreating the message elements on every render
  const messageElements = useMemo(() => 
    messages.map((message) => (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
        layout
      >
        <MemoizedMessageItem message={message} />
      </motion.div>
    )),
    [messages]
  );

  // Memoize the loading indicator to prevent recreating it on every render
  const loadingIndicator = useMemo(() => 
    isProcessing && (
      <motion.div
        key="loading-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4"
        layout
      >
        <Loading text="AI is thinking..." />
      </motion.div>
    ),
    [isProcessing]
  );

  return (
    <AnimatePresence mode="popLayout">
      {messageElements}
      {loadingIndicator}
    </AnimatePresence>
  );
});

ChatMessages.displayName = 'ChatMessages';