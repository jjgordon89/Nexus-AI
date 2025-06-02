import React from 'react';
import { ThemeSelector } from './theme-selector';
import { LanguageSelector } from './language-selector';
import { FontSizeSelector } from './font-size-selector';
import { AccessibilityOptions } from './accessibility-options';

export const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Appearance Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Customize how NexusAI looks and feels.
        </p>
      </div>

      <div className="space-y-6">
        <ThemeSelector />
        <LanguageSelector />
        <FontSizeSelector />
        <AccessibilityOptions />
      </div>
    </div>
  );
};