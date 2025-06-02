import React from 'react';
import { useSettingsStore } from '../../../../store/settings-store';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';
import { Slider } from '../../../ui/slider';
import { Switch } from '../../../ui/switch';
import { Tooltip } from '../../../ui/tooltip';
import { InfoIcon } from 'lucide-react';

export const EmbeddingsSettings: React.FC = () => {
  const { settings, updateAISettings } = useSettingsStore();
  const { ai } = settings;

  return (
    <div className="space-y-4">
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
    </div>
  );
};