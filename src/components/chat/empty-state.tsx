import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col h-screen items-center justify-center text-muted-foreground">
      <p>Select or start a new conversation</p>
    </div>
  );
};