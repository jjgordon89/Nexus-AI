import React, { useEffect } from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';
import { Input } from '../../../ui/input';
import { Tooltip } from '../../../ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { AI_MODELS } from '../../../../lib/ai/models';

export const GeneralSettings: React.FC = () => {
  const { settings, updateAISettings } = useSettingsStore();
  const { ai } = settings;

  // Update model when provider changes
  useEffect(() => {
    if (ai.provider !== 'openai-compatible') {
      const availableModels = AI_MODELS[ai.provider] || [];
      if (availableModels.length > 0 && !availableModels.find(model => model.id === ai.model)) {
        updateAISettings({ model: availableModels[0].id });
      }
    }
  }, [ai.provider, ai.model, updateAISettings]);

  const selectedModel = ai.provider !== 'openai-compatible' ? 
    AI_MODELS[ai.provider]?.find(model => model.id === ai.model) : 
    null;

  return (
    <div className="space-y-4">
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
      </div>

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
    </div>
  );
};