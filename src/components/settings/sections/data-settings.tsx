import React from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Switch } from '../../ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Button } from '../../ui/button';
import { Slider } from '../../ui/slider';
import { DatabaseIcon, DownloadIcon, TrashIcon } from 'lucide-react';

export const DataSettings: React.FC = () => {
  const { settings, updateDataSettings } = useSettingsStore();
  const { data } = settings;

  const handleExportData = () => {
    // Implementation for data export
    console.log('Exporting data...');
  };

  const handleClearData = () => {
    // Implementation for clearing data
    console.log('Clearing data...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Control how your data is stored and managed.
        </p>
      </div>

      <div className="space-y-6">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Storage Usage</label>
            <span className="text-sm text-muted-foreground">
              {data.storageLimit} MB limit
            </span>
          </div>
          <div className="pt-2">
            <Slider
              value={[data.storageLimit]}
              onValueChange={([value]) => updateDataSettings({ storageLimit: value })}
              min={100}
              max={10000}
              step={100}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">100 MB</span>
              <span className="text-xs text-muted-foreground">10 GB</span>
            </div>
          </div>
        </div>

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

          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
            <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your data is stored locally and never leaves your device unless you enable backups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};