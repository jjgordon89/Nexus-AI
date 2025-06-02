import React from 'react';
import { Button } from '../ui/button';
import { ChevronLeftIcon, ChevronRightIcon, BrainCogIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  isCollapsed, 
  setIsCollapsed 
}) => {
  return (
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
  );
};