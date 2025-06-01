import React from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';

export const AppearanceSettings: React.FC = () => {
  const { settings, updateAppearanceSettings } = useSettingsStore();
  const { appearance } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Customize how NexusAI looks and feels.
        </p>
      </div>

      <div className="space-y-6">
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

        <div className="space-y-3">
          <label className="text-sm font-medium">Language</label>
          <Select
            value={appearance.language}
            onValueChange={(value) => updateAppearanceSettings({ language: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Font Size</label>
          <div className="pt-2">
            <Slider
              value={[appearance.fontSize]}
              onValueChange={([value]) => updateAppearanceSettings({ fontSize: value })}
              min={12}
              max={24}
              step={1}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">12px</span>
              <span className="text-xs text-muted-foreground">24px</span>
            </div>
          </div>
        </div>

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
    </div>
  );
};