import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { Input } from '../../ui/input';
import { Slider } from '../../ui/slider';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Tooltip } from '../../ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { InfoIcon, CheckCircleIcon, XCircleIcon, BrainIcon, SparklesIcon, KeyIcon, GaugeIcon } from 'lucide-react';
import { AI_MODELS } from '../../../lib/ai/models';

export const AISettings: React.FC = () => {
  const { settings, updateAISettings } = useSettingsStore();
  const { ai } = settings;
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null);

  // Update model when provider changes
  useEffect(() => {
    if (ai.provider !== 'openai-compatible') {
      const availableModels = AI_MODELS[ai.provider] || [];
      if (availableModels.length > 0 && !availableModels.find(model => model.id === ai.model)) {
        updateAISettings({ model: availableModels[0].id });
      }
    }
  }, [ai.provider]);

  const selectedModel = ai.provider !== 'openai-compatible' ? 
    AI_MODELS[ai.provider]?.find(model => model.id === ai.model) : 
    null;

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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">AI Provider</label>
              <Tooltip content="Select the AI provider for your assistant">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <Select
              value={ai.provider}
              onValueChange={(value) => updateAISettings({ provider: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="google">Google AI</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="openai-compatible">OpenAI Compatible</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">AI Model</label>
                <Tooltip content="Select or enter the AI model to use">
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </Tooltip>
              </div>
              {ai.provider === 'openai-compatible' ? (
                <Input
                  value={ai.model}
                  onChange={(e) => updateAISettings({ model: e.target.value })}
                  placeholder="Enter model name (e.g., gpt-4, llama2-70b)"
                  className="font-mono"
                />
              ) : (
                <Select
                  value={ai.model}
                  onValueChange={(value) => updateAISettings({ model: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS[ai.provider]?.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedModel && (
              <div className="mt-2 p-3 rounded-md bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Tokens:</span>
                  <span>{selectedModel.maxTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input Cost:</span>
                  <span>${selectedModel.inputCostPer1k}/1K tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output Cost:</span>
                  <span>${selectedModel.outputCostPer1k}/1K tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features:</span>
                  <span>{selectedModel.features.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">System Message</label>
              <Tooltip content="Instructions that define the AI's behavior and role">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <textarea
              value={ai.systemMessage}
              onChange={(e) => updateAISettings({ systemMessage: e.target.value })}
              placeholder="Enter system message"
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <Tooltip content="Controls randomness in responses. Lower values are more focused, higher values more creative.">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <div className="pt-2">
              <Slider
                value={[ai.temperature]}
                onValueChange={([value]) => updateAISettings({ temperature: value })}
                min={0}
                max={1}
                step={0.1}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Focused (0.0)</span>
                <span className="text-xs text-muted-foreground">Creative (1.0)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Max Tokens</label>
              <Tooltip content="Maximum length of the AI's response in tokens">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <Input
              type="number"
              min={1}
              max={selectedModel?.maxTokens || 32000}
              value={ai.maxTokens}
              onChange={(e) => updateAISettings({ maxTokens: parseInt(e.target.value) })}
              placeholder="Enter max tokens"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Stream Responses</label>
                  <Tooltip content="Enable real-time streaming of AI responses">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Show responses as they are generated
                </p>
              </div>
              <Switch
                checked={ai.streamResponses}
                onCheckedChange={(checked) => updateAISettings({ streamResponses: checked })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="embeddings" className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Embedding Model</label>
              <Tooltip content="Select the model used for generating text embeddings">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <Select
              value={ai.embeddingModel}
              onValueChange={(value) => updateAISettings({ embeddingModel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select embedding model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-embedding-3-small">OpenAI Ada 3 Small</SelectItem>
                <SelectItem value="text-embedding-3-large">OpenAI Ada 3 Large</SelectItem>
                <SelectItem value="mistral-embed">Mistral Embed</SelectItem>
                <SelectItem value="all-MiniLM-L6-v2">Sentence Transformers (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Dimensions</label>
              <Tooltip content="Number of dimensions for the embedding vectors">
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </Tooltip>
            </div>
            <Select
              value={ai.embeddingDimensions?.toString()}
              onValueChange={(value) => updateAISettings({ embeddingDimensions: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dimensions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="384">384 (Sentence Transformers)</SelectItem>
                <SelectItem value="1024">1024 (Mistral)</SelectItem>
                <SelectItem value="1536">1536 (OpenAI)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Processing Speed/Quality</label>
                  <Tooltip content="Balance between processing speed and embedding quality">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Adjust the trade-off between speed and quality
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Slider
                value={[ai.embeddingQuality || 0.5]}
                onValueChange={([value]) => updateAISettings({ embeddingQuality: value })}
                min={0}
                max={1}
                step={0.1}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Faster</span>
                <span className="text-xs text-muted-foreground">Higher Quality</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Batch Processing</label>
                  <Tooltip content="Process multiple documents in parallel">
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </Tooltip>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enable parallel processing of multiple documents
                </p>
              </div>
              <Switch
                checked={ai.batchProcessing}
                onCheckedChange={(checked) => updateAISettings({ batchProcessing: checked })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};