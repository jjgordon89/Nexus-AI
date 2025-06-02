import React from 'react';
import { Button } from '../../ui/button';
import { Share2Icon, CopyIcon, MailIcon, LinkIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../ui/dropdown';
import { useAppStore } from '../../../store/app-store';
import { ShareHandler } from '../../../lib/share-handler';
import { useToast } from '../../ui/toast';

export const ShareMenu: React.FC = () => {
  const { currentConversationId, conversations } = useAppStore();
  const { toast } = useToast();
  
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );
  
  const handleShare = async (type: 'link' | 'copy' | 'email') => {
    if (!currentConversation) return;
    
    const success = await ShareHandler.shareConversation(currentConversation, { 
      type,
      includeAttachments: type !== 'link'
    });
    
    if (success) {
      let message = '';
      switch (type) {
        case 'link':
          message = 'Shareable link copied to clipboard';
          break;
        case 'copy':
          message = 'Conversation copied to clipboard';
          break;
        case 'email':
          message = 'Opening email client';
          break;
      }
      
      toast({
        title: 'Shared Successfully',
        description: message,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Share Failed',
        description: 'Unable to share the conversation',
        variant: 'destructive'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5">
          <Share2Icon className="h-3.5 w-3.5" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('link')}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Generate Shareable Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <CopyIcon className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <MailIcon className="h-4 w-4 mr-2" />
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};