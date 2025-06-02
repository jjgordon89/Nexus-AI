import React from 'react';
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

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isProcessing }) => {
  return (
    <AnimatePresence mode="popLayout">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <MemoizedMessageItem message={message} />
        </motion.div>
      ))}
      
      {isProcessing && (
        <motion.div
          key="loading-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4"
        >
          <Loading text="AI is thinking..." />
        </motion.div>
      )}
    </AnimatePresence>
  );
};