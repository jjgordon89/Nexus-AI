import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';

export const LanguageSelector: React.FC = () => {
  const { settings, updateAppearanceSettings } = useSettingsStore();
  const { appearance } = settings;

  return (
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
  );
};