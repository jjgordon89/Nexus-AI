import React from 'react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../theme-toggle';
import { cn } from '../../lib/utils';
import { 
  MessagesSquareIcon, 
  FileTextIcon, 
  SettingsIcon, 
  HelpCircleIcon 
} from 'lucide-react';

interface SidebarFooterProps {
  isCollapsed: boolean;
  activeTab: 'chats' | 'documents' | 'settings' | 'help';
  setActiveTab: (tab: 'chats' | 'documents' | 'settings' | 'help') => void;
  onOpenSettings: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ 
  isCollapsed, 
  activeTab, 
  setActiveTab,
  onOpenSettings
}) => {
  const handleTabChange = (tab: 'chats' | 'documents' | 'settings' | 'help') => {
    if (tab === 'settings') {
      onOpenSettings();
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="border-t border-border p-2">
      <div className="grid grid-cols-4 gap-1">
        <FooterButton 
          isActive={activeTab === 'chats'} 
          isCollapsed={isCollapsed} 
          onClick={() => handleTabChange('chats')}
          icon={<MessagesSquareIcon className="h-4 w-4" />}
          label="Chats"
        />
        
        <FooterButton 
          isActive={activeTab === 'documents'} 
          isCollapsed={isCollapsed} 
          onClick={() => handleTabChange('documents')}
          icon={<FileTextIcon className="h-4 w-4" />}
          label="Docs"
        />
        
        <FooterButton 
          isActive={activeTab === 'settings'} 
          isCollapsed={isCollapsed} 
          onClick={() => handleTabChange('settings')}
          icon={<SettingsIcon className="h-4 w-4" />}
          label="Settings"
        />
        
        <FooterButton 
          isActive={activeTab === 'help'} 
          isCollapsed={isCollapsed} 
          onClick={() => handleTabChange('help')}
          icon={<HelpCircleIcon className="h-4 w-4" />}
          label="Help"
        />
      </div>

      {!isCollapsed && (
        <div className="mt-2 px-2">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
};

// Extracted button component for consistency
interface FooterButtonProps {
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const FooterButton: React.FC<FooterButtonProps> = ({ 
  isActive, 
  isCollapsed, 
  onClick, 
  icon, 
  label 
}) => (
  <Button
    variant={isActive ? 'secondary' : 'ghost'}
    size="icon"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center h-auto py-2",
      isCollapsed ? "aspect-square" : ""
    )}
  >
    {icon}
    {!isCollapsed && <span className="text-xs mt-1">{label}</span>}
  </Button>
);