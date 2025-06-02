import React from 'react';
import { Button } from '../../../ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';

export const DataActions: React.FC = () => {
  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting data...');
  };

  const handleClearData = () => {
    // Implementation for clearing data
    console.log('Clearing data...');
  };
  
  return (
    <div className="space-y-4 pt-4">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleExportData}
      >
        <DownloadIcon className="h-4 w-4" />
        Export All Data
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleClearData}
      >
        <TrashIcon className="h-4 w-4" />
        Clear All Data
      </Button>
    </div>
  );
};