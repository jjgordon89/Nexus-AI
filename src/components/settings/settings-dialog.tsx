import React, { lazy } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useSettingsStore } from '../../store/settings-store';
import { LazyLoad, LazyProfileSettings, LazyAISettings, LazyAppearanceSettings, 
         LazyPrivacySettings, LazyNotificationSettings, LazyDataSettings, 
         LazyAboutSettings } from '../lazy';
import { Loading } from '../ui/loading';

const TabContentLoader = ({ children }: { children: React.ReactNode }) => (
  <LazyLoad fallback={
    <div className="flex items-center justify-center h-[500px]">
      <Loading text="Loading settings..." />
    </div>
  }>
    {children}
  </LazyLoad>
);

export const SettingsDialog: React.FC = () => {
  const { settings } = useSettingsStore();

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-lg shadow-lg">
      <Tabs.Root defaultValue="profile" className="flex h-[600px]">
        <Tabs.List className="w-48 shrink-0 border-r border-border">
          <div className="p-4 space-y-2">
            <Tabs.Trigger
              value="profile"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              Profile
            </Tabs.Trigger>
            <Tabs.Trigger
              value="ai"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              AI Settings
            </Tabs.Trigger>
            <Tabs.Trigger
              value="appearance"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              Appearance
            </Tabs.Trigger>
            <Tabs.Trigger
              value="privacy"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              Privacy & Security
            </Tabs.Trigger>
            <Tabs.Trigger
              value="notifications"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              Notifications
            </Tabs.Trigger>
            <Tabs.Trigger
              value="data"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              Data Management
            </Tabs.Trigger>
            <Tabs.Trigger
              value="about"
              className="w-full px-3 py-2 text-sm text-left rounded-md hover:bg-muted/50 data-[state=active]:bg-muted data-[state=active]:text-accent"
            >
              About
            </Tabs.Trigger>
          </div>
        </Tabs.List>

        <div className="flex-1 overflow-y-auto">
          <Tabs.Content value="profile" className="p-6">
            <TabContentLoader>
              <LazyProfileSettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="ai" className="p-6">
            <TabContentLoader>
              <LazyAISettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="appearance" className="p-6">
            <TabContentLoader>
              <LazyAppearanceSettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="privacy" className="p-6">
            <TabContentLoader>
              <LazyPrivacySettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="notifications" className="p-6">
            <TabContentLoader>
              <LazyNotificationSettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="data" className="p-6">
            <TabContentLoader>
              <LazyDataSettings />
            </TabContentLoader>
          </Tabs.Content>
          <Tabs.Content value="about" className="p-6">
            <TabContentLoader>
              <LazyAboutSettings />
            </TabContentLoader>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};