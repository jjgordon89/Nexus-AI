import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  center?: boolean;
}

export function Loading({ className, size = 'md', text, center = false }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const content = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex items-center gap-3',
        center && 'justify-center',
        className
      )}
    >
      <Loader2Icon className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {content}
      </div>
    );
  }

  return content;
}