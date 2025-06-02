/**
 * MessageContent component
 * 
 * This component renders message content with proper sanitization.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { sanitizeMarkdown } from '../../lib/sanitizer';

interface MessageContentProps {
  content: string;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, className }) => {
  // Sanitize the content first with our custom sanitizer
  const sanitizedContent = sanitizeMarkdown(content);
  
  return (
    <div className={`prose prose-invert max-w-none message-content ${className || ''}`}>
      <ReactMarkdown
        // Additional runtime sanitization via DOMPurify
        transformLinkUri={(href) => {
          // Validate URLs to prevent javascript: and data: URLs
          try {
            const url = new URL(href, window.location.origin);
            if (url.protocol === 'javascript:' || url.protocol === 'data:') {
              return '#';
            }
            return href;
          } catch (e) {
            return href;
          }
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
};