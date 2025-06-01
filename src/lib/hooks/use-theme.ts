import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettingsStore } from '../../store/settings-store';

export function useAppTheme() {
  const { theme, setTheme } = useTheme();
  const { settings, updateAppearanceSettings } = useSettingsStore();

  useEffect(() => {
    if (settings.appearance.theme !== theme) {
      updateAppearanceSettings({ theme: theme as 'light' | 'dark' | 'system' });
    }
  }, [theme, settings.appearance.theme, updateAppearanceSettings]);

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