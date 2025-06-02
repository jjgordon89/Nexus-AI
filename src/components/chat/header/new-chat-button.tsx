import React from 'react';
import { useAppStore } from '../../../store/app-store';
import { Button } from '../../ui/button';
import { PlusIcon } from 'lucide-react';

export const NewChatButton: React.FC = () => {
  const { createNewConversation } = useAppStore();
  
  return (
    <Button
      variant="gradient"
      size="sm"
      onClick={createNewConversation}
      className="gap-1.5"
    >
      <PlusIcon className="h-3.5 w-3.5" />
      New
    </Button>
  );
};