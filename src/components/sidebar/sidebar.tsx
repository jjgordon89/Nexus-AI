import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { SettingsDialog } from '../settings/settings-dialog';
import { ThemeToggle } from '../theme-toggle';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  MessagesSquareIcon, 
  FileTextIcon, 
  SettingsIcon, 
  HelpCircleIcon,
  BrainCogIcon
} from 'lucide-react';
import { ConversationList } from '../chat/conversation-list';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'documents' | 'settings' | 'help'>('chats');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "h-screen fixed top-0 left-0 z-30 flex transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex-1 flex flex-col bg-card border-r border-border relative">
          <div className="flex h-14 items-center px-4 border-b border-border gap-2">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 flex-1"
              >
                <div className="h-7 w-7 rounded-full bg-holographic-primary animated-gradient flex items-center justify-center">
                  <BrainCogIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">NexusAI</span>
              </motion.div>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  {activeTab === 'chats' && <ConversationList />}
                  {activeTab === 'documents' && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Document library will be available here.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="border-t border-border p-2">
            <div className="grid grid-cols-4 gap-1">
              <Button
                variant={activeTab === 'chats' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActiveTab('chats')}
                className={cn(
                  "flex flex-col items-center justify-center h-auto py-2",
                  isCollapsed ? "aspect-square" : ""
                )}
              >
                <MessagesSquareIcon className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs mt-1">Chats</span>}
              </Button>
              
              <Button
                variant={activeTab === 'documents' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActiveTab('documents')}
                className={cn(
                  "flex flex-col items-center justify-center h-auto py-2",
                  isCollapsed ? "aspect-square" : ""
                )}
              >
                <FileTextIcon className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs mt-1">Docs</span>}
              </Button>
              
              <Button
                variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className={cn(
                  "flex flex-col items-center justify-center h-auto py-2",
                  isCollapsed ? "aspect-square" : ""
                )}
              >
                <SettingsIcon className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs mt-1">Settings</span>}
              </Button>
              
              <Button
                variant={activeTab === 'help' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setActiveTab('help')}
                className={cn(
                  "flex flex-col items-center justify-center h-auto py-2",
                  isCollapsed ? "aspect-square" : ""
                )}
              >
                <HelpCircleIcon className="h-4 w-4" />
                {!isCollapsed && <span className="text-xs mt-1">Help</span>}
              </Button>
            </div>

            {!isCollapsed && (
              <div className="mt-2 px-2">
                <ThemeToggle />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <SettingsDialog />
        </DialogContent>
      </Dialog>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-20"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
};