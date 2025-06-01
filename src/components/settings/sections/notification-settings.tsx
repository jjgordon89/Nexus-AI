import React from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Switch } from '../../ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Input } from '../../ui/input';
import { Slider } from '../../ui/slider';

export const NotificationSettings: React.FC = () => {
  const { settings, updateNotificationSettings } = useSettingsStore();
  const { notifications } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your notification preferences and alert settings.
        </p>
      </div>

      <div className="space-y-6">
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
      </div>
    </div>
  );
};