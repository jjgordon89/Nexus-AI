import React, { memo, useMemo } from 'react';
import { Message } from '../../types';
import { Avatar } from '../ui/avatar';
import { BotIcon, User2Icon } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Loading } from '../ui/loading';
import { MessageContent } from '../ui/message-content';

interface MessageItemProps {
  message: Message;
}

const MessageItemComponent: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Memoize the avatar component
  const avatarComponent = useMemo(() => (
    <Avatar>
      {isUser ? (
        <User2Icon className="h-6 w-6 text-primary-300" />
      ) : (
        <BotIcon className="h-6 w-6 text-secondary-300" />
      )}
    </Avatar>
  ), [isUser]);
  
  // Memoize the message header
  const messageHeader = useMemo(() => (
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-sm">
        {isUser ? 'You' : 'NexusAI'}
      </h3>
      <span className="text-xs text-muted-foreground">
        {formatDate(message.timestamp)}
      </span>
    </div>
  ), [isUser, message.timestamp]);
  
  // Memoize attachments if they exist
  const attachmentsElement = useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {message.attachments.map((attachment) => (
          <div 
            key={attachment.id}
            className="px-3 py-1.5 text-xs rounded-full bg-muted flex items-center gap-1.5"
          >
            <span>{attachment.name}</span>
            <span className="text-muted-foreground">
              ({Math.round(attachment.size / 1024)} KB)
            </span>
          </div>
        ))}
      </div>
    );
  }, [message.attachments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`py-6 ${isUser ? 'bg-transparent' : 'bg-muted/20'}`}
      layout
    >
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {avatarComponent}
          </div>

          <div className="flex-1 space-y-2">
            {messageHeader}

            {message.isThinking ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loading size="sm" text="Thinking..." />
              </div>
            ) : (
              <MessageContent content={message.content} />
            )}

            {attachmentsElement}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders with deep comparison
export const MessageItem = memo(
  MessageItemComponent,
  (prevProps, nextProps) => {
    // Only re-render if content or isThinking changed
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.isThinking === nextProps.message.isThinking
    );
  }
);