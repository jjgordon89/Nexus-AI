import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';
import { Slider } from '../../../ui/slider';

export const SoundSettings: React.FC = () => {
  const { settings, updateNotificationSettings } = useSettingsStore();
  const { notifications } = settings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Sound</label>
          <p className="text-xs text-muted-foreground">
            Play sound for notifications
          </p>
        </div>
        <Switch
          checked={notifications.sound}
          onCheckedChange={(checked) => updateNotificationSettings({ sound: checked })}
        />
      </div>

      {notifications.sound && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Volume</label>
          <div className="pt-2">
            <Slider
              value={[notifications.volume]}
              onValueChange={([value]) => updateNotificationSettings({ volume: value })}
              min={0}
              max={100}
              step={1}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">0%</span>
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};