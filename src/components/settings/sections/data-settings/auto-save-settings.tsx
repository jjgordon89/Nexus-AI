import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';

export const AutoSaveSettings: React.FC = () => {
  const { settings, updateDataSettings } = useSettingsStore();
  const { data } = settings;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">Auto-Save</label>
        <p className="text-xs text-muted-foreground">
          Automatically save changes and conversations
        </p>
      </div>
      <Switch
        checked={data.autoSave}
        onCheckedChange={(checked) => updateDataSettings({ autoSave: checked })}
      />
    </div>
  );
};