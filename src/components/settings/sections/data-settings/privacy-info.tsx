import React from 'react';
import { DatabaseIcon } from 'lucide-react';

export const PrivacyInfo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
      <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Your data is stored locally and never leaves your device unless you enable backups.
      </p>
    </div>
  );
};