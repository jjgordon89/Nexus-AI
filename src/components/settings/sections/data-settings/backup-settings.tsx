import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';

export const BackupSettings: React.FC = () => {
  const { settings, updateDataSettings } = useSettingsStore();
  const { data } = settings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Backup</label>
          <p className="text-xs text-muted-foreground">
            Enable automatic backups of your data
          </p>
        </div>
        <Switch
          checked={data.backupEnabled}
          onCheckedChange={(checked) => updateDataSettings({ backupEnabled: checked })}
        />
      </div>

      {data.backupEnabled && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Backup Frequency</label>
          <Select
            value={data.backupFrequency}
            onValueChange={(value) => updateDataSettings({ backupFrequency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select backup frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};