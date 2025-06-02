import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/app-store';
import { useSettingsStore } from '../../store/settings-store';
import { Button } from '../ui/button';
import { PlusIcon, MoreHorizontalIcon, Share2Icon, ExternalLinkIcon, PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { ExportHandler } from '../../lib/export-handler';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown';

export const ChatHeader: React.FC = () => {
  const { 
    currentConversationId, 
    conversations, 
    createNewConversation,
    updateCurrentConversationTitle
  } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditedTitle(currentConversation?.title || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedTitle.trim()) {
      updateCurrentConversationTitle(editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(currentConversation?.title || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  const handleExport = (format: 'json' | 'markdown' | 'text' | 'html') => {
    if (currentConversation) {
      ExportHandler.exportConversation(currentConversation, format);
    }
  };
  
  if (!currentConversation) return null;
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-muted px-2 py-1 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 w-[200px]"
                  placeholder="Enter conversation title"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-success hover:text-success/80"
                  onClick={handleSave}
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive/80"
                  onClick={handleCancel}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="font-semibold truncate max-w-[200px] md:max-w-xs">
                  {currentConversation.title}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleStartEditing}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
              <Share2Icon className="h-3.5 w-3.5" />
              Share
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('markdown')}>
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('text')}>
                  Export as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  Export as HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="gradient"
              size="sm"
              onClick={createNewConversation}
              className="gap-1.5"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};