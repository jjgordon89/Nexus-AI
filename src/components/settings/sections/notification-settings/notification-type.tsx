import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';

export const NotificationType: React.FC = () => {
  const { settings, updateNotificationSettings } = useSettingsStore();
  const { notifications } = settings;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Notification Type</label>
      <Select
        value={notifications.type}
        onValueChange={(value) => updateNotificationSettings({ type: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select notification type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Notifications</SelectItem>
          <SelectItem value="mentions">Mentions Only</SelectItem>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};