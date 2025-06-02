import React, { useMemo, useEffect, useState } from 'react';
import { MessageItem } from './message-item';
import { Loading } from '../ui/loading';
import { Message } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { VirtualizedMessageList } from './virtualized-message-list';
import { useSettingsStore } from '../../store/settings-store';

// Memoized MessageItem to prevent unnecessary re-renders
const MemoizedMessageItem = React.memo(MessageItem);

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
}

const VIRTUALIZATION_THRESHOLD = 25; // Number of messages before switching to virtualization

/**
 * Component for displaying chat messages with animations
 * Uses virtualization for long message lists to improve performance
 */
export const ChatMessages: React.FC<ChatMessagesProps> = React.memo(({ messages, isProcessing }) => {
  const [useVirtualization, setUseVirtualization] = useState(false);
  const { settings } = useSettingsStore();
  const reducedMotion = settings.appearance.reducedMotion;

  // Determine whether to use virtualization based on message count
  useEffect(() => {
    // Only use virtualization for longer lists
    setUseVirtualization(messages.length >= VIRTUALIZATION_THRESHOLD);
  }, [messages.length]);

  // Use useMemo to avoid recreating the message elements on every render
  const messageElements = useMemo(() => 
    messages.map((message) => (
      <motion.div
        key={message.id}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.3 }}
        className="mb-6"
        layout={!reducedMotion}
      >
        <MemoizedMessageItem message={message} />
      </motion.div>
    )),
    [messages, reducedMotion]
  );

  // Memoize the loading indicator to prevent recreating it on every render
  const loadingIndicator = useMemo(() => 
    isProcessing && (
      <motion.div
        key="loading-indicator"
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4"
        layout={!reducedMotion}
      >
        <Loading text="AI is thinking..." />
      </motion.div>
    ),
    [isProcessing, reducedMotion]
  );

  // Use virtualization for long message lists
  if (useVirtualization) {
    return <VirtualizedMessageList messages={messages} isProcessing={isProcessing} />;
  }

  // Use standard rendering for shorter lists
  return (
    <AnimatePresence mode="popLayout">
      {messageElements}
      {loadingIndicator}
    </AnimatePresence>
  );
});

ChatMessages.displayName = 'ChatMessages';