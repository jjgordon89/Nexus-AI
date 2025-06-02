import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';

export const NotificationToggle: React.FC = () => {
  const { settings, updateNotificationSettings } = useSettingsStore();
  const { notifications } = settings;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">Enable Notifications</label>
        <p className="text-xs text-muted-foreground">
          Receive alerts and important updates
        </p>
      </div>
      <Switch
        checked={notifications.enabled}
        onCheckedChange={(checked) => updateNotificationSettings({ enabled: checked })}
      />
    </div>
  );
};