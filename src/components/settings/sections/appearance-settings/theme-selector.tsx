import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';

export const ThemeSelector: React.FC = () => {
  const { settings, updateAppearanceSettings } = useSettingsStore();
  const { appearance } = settings;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Theme</label>
      <Select
        value={appearance.theme}
        onValueChange={(value) => updateAppearanceSettings({ theme: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};