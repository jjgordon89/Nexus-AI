import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Switch } from '../../../ui/switch';

export const AccessibilityOptions: React.FC = () => {
  const { settings, updateAppearanceSettings } = useSettingsStore();
  const { appearance } = settings;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Reduced Motion</label>
          <p className="text-xs text-muted-foreground">
            Minimize animations and transitions
          </p>
        </div>
        <Switch
          checked={appearance.reducedMotion}
          onCheckedChange={(checked) => updateAppearanceSettings({ reducedMotion: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">High Contrast</label>
          <p className="text-xs text-muted-foreground">
            Increase contrast for better visibility
          </p>
        </div>
        <Switch
          checked={appearance.highContrast}
          onCheckedChange={(checked) => updateAppearanceSettings({ highContrast: checked })}
        />
      </div>
    </div>
  );
};