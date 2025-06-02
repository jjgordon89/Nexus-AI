import React from 'react';
import { Button } from '../../ui/button';
import { ExternalLinkIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../ui/dropdown';
import { useAppStore } from '../../../store/app-store';
import { ExportHandler } from '../../../lib/export-handler';

export const ExportMenu: React.FC = () => {
  const { currentConversationId, conversations } = useAppStore();
  
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );
  
  const handleExport = (format: 'json' | 'markdown' | 'text' | 'html') => {
    if (currentConversation) {
      ExportHandler.exportConversation(currentConversation, format);
    }
  };

  return (
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
  );
};