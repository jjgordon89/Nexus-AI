import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Slider } from '../../../ui/slider';

export const FontSizeSelector: React.FC = () => {
  const { settings, updateAppearanceSettings } = useSettingsStore();
  const { appearance } = settings;

  return (
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
  );
};