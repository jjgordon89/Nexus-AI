import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Slider } from '../../../ui/slider';
import { Input } from '../../../ui/input';
import { Switch } from '../../../ui/switch';
import { Tooltip } from '../../../ui/tooltip';
import { InfoIcon } from 'lucide-react';

export const PerformanceSettings: React.FC = () => {
  const { settings, updateAISettings } = useSettingsStore();
  const { ai } = settings;

  return (
    <div className="space-y-4">
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
          max={32000}
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
    </div>
  );
};