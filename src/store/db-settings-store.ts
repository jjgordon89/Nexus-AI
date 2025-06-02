/**
 * Database-backed settings store
 * 
 * This store provides the same API as the original settings-store, but uses
 * the database for persistent storage instead of localStorage.
 */

import { create } from 'zustand';
import { UserSettings } from '../types/settings';
import { secureStorage } from '../lib/secure-storage';
import { SettingsRepository } from '../lib/db';

// Default user ID for demo purposes (in a real app, this would come from authentication)
const DEFAULT_USER_ID = 'demo-user';

const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: '',
    email: '',
  },
  appearance: {
    theme: 'system',
    language: 'en',
    fontSize: 16,
    reducedMotion: false,
    highContrast: false,
  },
  privacy: {
    dataSharing: true,
    analyticsEnabled: true,
    historyEnabled: true,
    dataRetention: '90days',
  },
  notifications: {
    enabled: true,
    type: 'all',
    sound: true,
    volume: 50,
    doNotDisturb: false,
  },
  data: {
    autoSave: true,
    backupEnabled: false,
    backupFrequency: 'weekly',
    storageLimit: 1000,
  },
  ai: {
    provider: 'google',
    model: 'gemini-1.5-pro',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
    systemMessage: 'You are a helpful AI assistant.',
    streamResponses: false,
    embeddingModel: 'text-embedding-3-small',
    embeddingDimensions: 1536,
    embeddingQuality: 0.5,
    batchProcessing: false,
  },
};

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  updateProfileSettings: (profile: Partial<UserSettings['profile']>) => Promise<void>;
  updateAppearanceSettings: (appearance: Partial<UserSettings['appearance']>) => Promise<void>;
  updatePrivacySettings: (privacy: Partial<UserSettings['privacy']>) => Promise<void>;
  updateNotificationSettings: (notifications: Partial<UserSettings['notifications']>) => Promise<void>;
  updateDataSettings: (data: Partial<UserSettings['data']>) => Promise<void>;
  updateAISettings: (ai: Partial<UserSettings['ai']>) => Promise<void>;
  resetSettings: () => Promise<void>;
  getSecureApiKey: () => string | null;
  loadSettings: () => Promise<void>;
}

export const useDBSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  
  /**
   * Load user settings from the database
   */
  loadSettings: async () => {
    try {
      // Get settings from database
      const settings = await SettingsRepository.getSettings(DEFAULT_USER_ID);
      
      if (settings) {
        set({ settings });
      } else {
        // If no settings found, save default settings
        await SettingsRepository.saveSettings(DEFAULT_USER_ID, DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Fall back to default settings
      set({ settings: DEFAULT_SETTINGS });
    }
  },
  
  updateSettings: async (newSettings) => {
    const settings = { ...get().settings, ...newSettings };
    
    // Store API key securely if present
    if (newSettings.ai?.apiKey) {
      secureStorage.setItem('api_key', newSettings.ai.apiKey);
      // Remove API key from the state to avoid storing it in the database
      settings.ai.apiKey = '';
    }
    
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
    
  updateProfileSettings: async (profile) => {
    const settings = {
      ...get().settings,
      profile: { ...get().settings.profile, ...profile },
    };
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save profile settings:', error);
    }
  },
    
  updateAppearanceSettings: async (appearance) => {
    const settings = {
      ...get().settings,
      appearance: { ...get().settings.appearance, ...appearance },
    };
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    }
  },
    
  updatePrivacySettings: async (privacy) => {
    const settings = {
      ...get().settings,
      privacy: { ...get().settings.privacy, ...privacy },
    };
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  },
    
  updateNotificationSettings: async (notifications) => {
    const settings = {
      ...get().settings,
      notifications: { ...get().settings.notifications, ...notifications },
    };
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  },
    
  updateDataSettings: async (data) => {
    const settings = {
      ...get().settings,
      data: { ...get().settings.data, ...data },
    };
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save data settings:', error);
    }
  },

  updateAISettings: async (ai) => {
    const settings = {
      ...get().settings,
      ai: { ...get().settings.ai, ...ai },
    };
    
    // Store API key securely if present
    if (ai.apiKey) {
      secureStorage.setItem('api_key', ai.apiKey);
      // Remove API key from the state to avoid storing it in the database
      settings.ai.apiKey = '';
    }
    
    set({ settings });
    
    // Save to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, settings);
    } catch (error) {
      console.error('Failed to save AI settings:', error);
    }
  },
    
  resetSettings: async () => {
    // Clear secure storage
    secureStorage.clear();
    set({ settings: DEFAULT_SETTINGS });
    
    // Save default settings to database
    try {
      await SettingsRepository.saveSettings(DEFAULT_USER_ID, DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Failed to save default settings:', error);
    }
  },
  
  getSecureApiKey: () => {
    return secureStorage.getItem('api_key');
  },
}));