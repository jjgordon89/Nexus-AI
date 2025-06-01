import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { SendIcon, PaperclipIcon, MicIcon, BrainIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { MessageValidator } from '../../lib/validators';
import { useToast } from '../ui/toast';

interface ChatInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  isProcessing: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isProcessing }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      MessageValidator.parse({ content: message });
      
      if (selectedFiles.length > 0) {
        const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
        if (totalSize > 25 * 1024 * 1024) {
          throw new Error('Total file size exceeds 25MB limit');
        }
      }
      
      onSendMessage(message, selectedFiles);
      setMessage('');
      setSelectedFiles([]);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      validateAndSendMessage(e);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: `${file.name} exceeds 25MB size limit`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-border py-4 bg-background/80 backdrop-blur-sm sticky bottom-0 z-10">
      <div className="container max-w-4xl mx-auto px-4">
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm group"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={false}
          animate={isFocused ? { boxShadow: '0 0 0 2px rgba(138, 43, 226, 0.3)' } : {}}
          className={cn(
            "rounded-lg glass-card p-1 transition-all",
            isFocused ? 'gradient-border' : 'border border-border'
          )}
        >
          <form onSubmit={validateAndSendMessage} className="flex items-end gap-2">
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              onClick={handleFileUpload}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              disabled={isProcessing}
            >
              <PaperclipIcon className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            
            <input 
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept=".txt,.md,.pdf,.doc,.docx,.csv"
            />
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={isProcessing ? "Please wait..." : "Message NexusAI..."}
                disabled={isProcessing}
                rows={1}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-2.5 px-2 text-sm max-h-[200px] min-h-[44px] disabled:opacity-50"
              />
            </div>
            
            <div className="flex items-center gap-2 pb-1 pr-1">
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                disabled={isProcessing}
              >
                <MicIcon className="h-5 w-5" />
                <span className="sr-only">Voice input</span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                disabled={isProcessing}
              >
                <BrainIcon className="h-5 w-5" />
                <span className="sr-only">AI options</span>
              </Button>
              
              <Button 
                type="submit"
                variant="gradient" 
                size="icon"
                disabled={(!message.trim() && selectedFiles.length === 0) || isProcessing}
                className="shrink-0"
              >
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
        </motion.div>
        
        <div className="mt-2 text-xs text-center text-muted-foreground">
          NexusAI may produce inaccurate information about people, places, or facts.
        </div>
      </div>
    </div>
  );
};