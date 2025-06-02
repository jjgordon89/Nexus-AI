import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types/settings';
import { secureStorage } from '../lib/secure-storage';

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
  performance: {
    enableConversationVirtualization: true,
    conversationVirtualizationThreshold: 20,
  },
};

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateProfileSettings: (profile: Partial<UserSettings['profile']>) => void;
  updateAppearanceSettings: (appearance: Partial<UserSettings['appearance']>) => void;
  updatePrivacySettings: (privacy: Partial<UserSettings['privacy']>) => void;
  updateNotificationSettings: (notifications: Partial<UserSettings['notifications']>) => void;
  updateDataSettings: (data: Partial<UserSettings['data']>) => void;
  updateAISettings: (ai: Partial<UserSettings['ai']>) => void;
  updatePerformanceSettings: (performance: Partial<UserSettings['performance']>) => void;
  resetSettings: () => void;
  getSecureApiKey: () => string | null;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      
      updateSettings: (newSettings) => {
        const settings = { ...get().settings, ...newSettings };
        
        // Store API key securely if present
        if (newSettings.ai?.apiKey) {
          secureStorage.setItem('api_key', newSettings.ai.apiKey);
          // Remove API key from the state to avoid storing it in localStorage
          settings.ai.apiKey = '';
        }
        
        set({ settings });
      },
        
      updateProfileSettings: (profile) => {
        const settings = {
          ...get().settings,
          profile: { ...get().settings.profile, ...profile },
        };
        set({ settings });
      },
        
      updateAppearanceSettings: (appearance) => {
        const settings = {
          ...get().settings,
          appearance: { ...get().settings.appearance, ...appearance },
        };
        set({ settings });
      },
        
      updatePrivacySettings: (privacy) => {
        const settings = {
          ...get().settings,
          privacy: { ...get().settings.privacy, ...privacy },
        };
        set({ settings });
      },
        
      updateNotificationSettings: (notifications) => {
        const settings = {
          ...get().settings,
          notifications: { ...get().settings.notifications, ...notifications },
        };
        set({ settings });
      },
        
      updateDataSettings: (data) => {
        const settings = {
          ...get().settings,
          data: { ...get().settings.data, ...data },
        };
        set({ settings });
      },

      updateAISettings: (ai) => {
        const settings = {
          ...get().settings,
          ai: { ...get().settings.ai, ...ai },
        };
        
        // Store API key securely if present
        if (ai.apiKey) {
          secureStorage.setItem('api_key', ai.apiKey);
          // Remove API key from the state to avoid storing it in localStorage
          settings.ai.apiKey = '';
        }
        
        set({ settings });
      },

      updatePerformanceSettings: (performance) => {
        const settings = {
          ...get().settings,
          performance: { ...get().settings.performance, ...performance },
        };
        set({ settings });
      },
        
      resetSettings: () => {
        // Clear secure storage
        secureStorage.clear();
        set({ settings: DEFAULT_SETTINGS });
      },
      
      getSecureApiKey: () => {
        return secureStorage.getItem('api_key');
      },
    }),
    {
      name: 'nexus-settings',
      version: 1,
    }
  )
);