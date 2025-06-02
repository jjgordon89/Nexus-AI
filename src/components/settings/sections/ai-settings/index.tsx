import React from 'react';
import { GeneralSettings } from './general-settings';
import { ProviderSettings } from './provider-settings';
import { PerformanceSettings } from './performance-settings';
import { EmbeddingsSettings } from './embeddings-settings';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/tabs';
import { BrainIcon, KeyIcon, GaugeIcon, SparklesIcon } from 'lucide-react';

export const AISettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">AI Settings</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your AI assistant's behavior and capabilities.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="provider" className="gap-2">
            <KeyIcon className="h-4 w-4" />
            Provider
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <GaugeIcon className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="embeddings" className="gap-2">
            <BrainIcon className="h-4 w-4" />
            Embeddings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
          <ProviderSettings />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceSettings />
        </TabsContent>

        <TabsContent value="embeddings" className="space-y-6">
          <EmbeddingsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};