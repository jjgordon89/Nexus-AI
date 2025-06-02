import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '../../store/settings-store';

/**
 * Custom hook for handling theme settings and system preferences
 * Syncs theme between next-themes and settings store
 */
export function useAppTheme() {
  const { theme, setTheme } = useTheme();
  const { settings, updateAppearanceSettings } = useSettingsStore();

  // Sync theme from next-themes to settings store
  useEffect(() => {
    if (settings.appearance.theme !== theme) {
      updateAppearanceSettings({ theme: theme as 'light' | 'dark' | 'system' });
    }
  }, [theme, settings.appearance.theme, updateAppearanceSettings]);

  // Listen for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    updateAppearanceSettings({ reducedMotion: mediaQuery.matches });

    const handler = (e: MediaQueryListEvent) => {
      updateAppearanceSettings({ reducedMotion: e.matches });
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [updateAppearanceSettings]);

  return { theme, setTheme };
}