import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Slider } from '../../../ui/slider';

export const StorageSettings: React.FC = () => {
  const { settings, updateDataSettings } = useSettingsStore();
  const { data } = settings;

  return (
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
  );
};