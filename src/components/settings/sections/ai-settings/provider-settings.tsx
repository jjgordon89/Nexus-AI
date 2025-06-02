import React, { useState } from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Tooltip } from '../../../ui/tooltip';
import { InfoIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

export const ProviderSettings: React.FC = () => {
  const { settings, updateAISettings } = useSettingsStore();
  const { ai } = settings;
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">API Key</label>
          <Tooltip content="Your API key for accessing the selected AI model">
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
        </div>
        <Input
          type="password"
          value={ai.apiKey || ''}
          onChange={(e) => updateAISettings({ apiKey: e.target.value })}
          placeholder="Enter your API key"
          className="font-mono"
        />
      </div>

      {ai.provider === 'openai-compatible' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Base URL</label>
            <Tooltip content="The base URL for your OpenAI-compatible API endpoint">
              <InfoIcon className="h-4 w-4 text-muted-foreground" />
            </Tooltip>
          </div>
          <Input
            type="url"
            value={ai.baseUrl || ''}
            onChange={(e) => updateAISettings({ baseUrl: e.target.value })}
            placeholder="https://api.your-provider.com/v1"
            className="font-mono"
          />
        </div>
      )}

      <Button
        variant="outline"
        className="w-full relative"
        onClick={handleTestConnection}
        disabled={isTestingConnection || !ai.apiKey || (ai.provider === 'openai-compatible' && !ai.baseUrl)}
      >
        {isTestingConnection ? (
          <span>Testing Connection...</span>
        ) : connectionStatus === 'success' ? (
          <span className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 text-success" />
            Connection Successful
          </span>
        ) : connectionStatus === 'error' ? (
          <span className="flex items-center gap-2">
            <XCircleIcon className="h-4 w-4 text-destructive" />
            Connection Failed
          </span>
        ) : (
          <span>Test Connection</span>
        )}
      </Button>
    </div>
  );
};