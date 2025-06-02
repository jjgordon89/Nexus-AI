import React, { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Loading } from '../ui/loading';
import { SidebarHeader } from './sidebar-header';
import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load settings dialog
const LazySettingsDialog = lazy(() => 
  import('../settings/settings-dialog').then(module => ({ default: module.SettingsDialog }))
);

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'documents' | 'settings' | 'help'>('chats');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div
        className={`h-screen fixed top-0 left-0 z-30 flex transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex-1 flex flex-col bg-card border-r border-border relative">
          <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          
          <SidebarContent 
            isCollapsed={isCollapsed} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
          />
          
          <SidebarFooter 
            isCollapsed={isCollapsed} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        </div>
      </div>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">Settings</DialogTitle>
          <Suspense fallback={
            <div className="h-[600px] flex items-center justify-center">
              <Loading text="Loading settings..." />
            </div>
          }>
            <LazySettingsDialog />
          </Suspense>
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