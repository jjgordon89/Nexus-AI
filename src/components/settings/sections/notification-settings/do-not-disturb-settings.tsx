import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';
import { Input } from '../../../ui/input';

export const DoNotDisturbSettings: React.FC = () => {
  const { settings, updateNotificationSettings } = useSettingsStore();
  const { notifications } = settings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Do Not Disturb</label>
          <p className="text-xs text-muted-foreground">
            Mute notifications during specific hours
          </p>
        </div>
        <Switch
          checked={notifications.doNotDisturb}
          onCheckedChange={(checked) => updateNotificationSettings({ doNotDisturb: checked })}
        />
      </div>

      {notifications.doNotDisturb && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="time"
              value={notifications.doNotDisturbStart || '22:00'}
              onChange={(e) => updateNotificationSettings({ doNotDisturbStart: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Time</label>
            <Input
              type="time"
              value={notifications.doNotDisturbEnd || '07:00'}
              onChange={(e) => updateNotificationSettings({ doNotDisturbEnd: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
};