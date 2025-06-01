import React from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Switch } from '../../ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';

export const PrivacySettings: React.FC = () => {
  const { settings, updatePrivacySettings } = useSettingsStore();
  const { privacy } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Control your privacy settings and manage how your data is used.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Data Sharing</label>
            <p className="text-xs text-muted-foreground">
              Allow sharing of non-personal data to improve the service
            </p>
          </div>
          <Switch
            checked={privacy.dataSharing}
            onCheckedChange={(checked) => updatePrivacySettings({ dataSharing: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Analytics</label>
            <p className="text-xs text-muted-foreground">
              Help us improve by sending anonymous usage data
            </p>
          </div>
          <Switch
            checked={privacy.analyticsEnabled}
            onCheckedChange={(checked) => updatePrivacySettings({ analyticsEnabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Conversation History</label>
            <p className="text-xs text-muted-foreground">
              Store chat history for personalized responses
            </p>
          </div>
          <Switch
            checked={privacy.historyEnabled}
            onCheckedChange={(checked) => updatePrivacySettings({ historyEnabled: checked })}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Data Retention</label>
          <Select
            value={privacy.dataRetention}
            onValueChange={(value) => updatePrivacySettings({ dataRetention: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select retention period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
              <SelectItem value="forever">Forever</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how long to keep your conversation history
          </p>
        </div>
      </div>
    </div>
  );
};