import React from 'react';
import { AutoSaveSettings } from './auto-save-settings';
import { BackupSettings } from './backup-settings';
import { StorageSettings } from './storage-settings';
import { DataActions } from './data-actions';
import { PrivacyInfo } from './privacy-info';

export const DataSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Control how your data is stored and managed.
        </p>
      </div>

      <div className="space-y-6">
        <AutoSaveSettings />
        <BackupSettings />
        <StorageSettings />
        <DataActions />
        <PrivacyInfo />
      </div>
    </div>
  );
};