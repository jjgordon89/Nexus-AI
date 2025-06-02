import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/app-store';
import { Button } from '../../ui/button';
import { PencilIcon, CheckIcon, XIcon } from 'lucide-react';
import { Conversation } from '../../../types';

interface TitleEditorProps {
  conversation: Conversation;
}

export const TitleEditor: React.FC<TitleEditorProps> = ({ conversation }) => {
  const { updateCurrentConversationTitle } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    setEditedTitle(conversation.title);
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
    setEditedTitle(conversation.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
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
            {conversation.title}
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
  );
};