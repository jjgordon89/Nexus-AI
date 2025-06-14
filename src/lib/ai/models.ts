import { AIModel } from './types';

/**
 * Dictionary of available AI models organized by provider
 */
export const AI_MODELS: Record<string, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4-turbo-preview',
      name: 'GPT-4 Turbo',
      provider: 'openai',
      maxTokens: 128000,
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
      features: ['chat', 'completion', 'vision', 'json'],
      contextWindow: 128000,
      knowledgeCutoff: '2024-04',
      description: 'Most capable model, ideal for complex tasks requiring deep understanding and analysis',
      capabilities: ['Advanced reasoning', 'Code generation', 'Creative writing', 'Mathematical analysis'],
    },
    {
      id: 'gpt-4-vision-preview',
      name: 'GPT-4 Vision',
      provider: 'openai',
      maxTokens: 128000,
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
      features: ['chat', 'completion', 'vision'],
      contextWindow: 128000,
      knowledgeCutoff: '2024-04',
      description: 'Specialized model for vision-language tasks and image analysis',
      capabilities: ['Image understanding', 'Visual analysis', 'Multimodal reasoning', 'Image-based tasks'],
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      inputCostPer1k: 0.03,
      outputCostPer1k: 0.06,
      features: ['chat', 'completion'],
      contextWindow: 8192,
      knowledgeCutoff: '2023-04',
      description: 'Highly capable model for complex tasks and detailed analysis',
      capabilities: ['Complex reasoning', 'Technical writing', 'Code analysis', 'Expert explanations'],
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 16385,
      inputCostPer1k: 0.0005,
      outputCostPer1k: 0.0015,
      features: ['chat', 'completion'],
      contextWindow: 16385,
      knowledgeCutoff: '2023-09',
      description: 'Fast and cost-effective model for general-purpose tasks',
      capabilities: ['General writing', 'Basic coding', 'Translation', 'Summarization'],
    },
  ],
  anthropic: [
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
      features: ['chat', 'completion', 'vision', 'analysis'],
      contextWindow: 200000,
      knowledgeCutoff: '2024-03',
      description: 'Most powerful Claude model with exceptional reasoning and analysis capabilities',
      capabilities: ['Complex analysis', 'Research synthesis', 'Technical writing', 'Code generation'],
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
      features: ['chat', 'completion', 'vision'],
      contextWindow: 200000,
      knowledgeCutoff: '2024-03',
      description: 'Balanced model offering strong performance at lower cost',
      capabilities: ['Content creation', 'Data analysis', 'Programming assistance', 'Research'],
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      maxTokens: 200000,
      inputCostPer1k: 0.0005,
      outputCostPer1k: 0.0025,
      features: ['chat', 'completion', 'vision'],
      contextWindow: 200000,
      knowledgeCutoff: '2024-03',
      description: 'Fastest Claude model, optimized for rapid response and efficiency',
      capabilities: ['Quick responses', 'Basic analysis', 'Content generation', 'Simple tasks'],
    },
  ],
  google: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'google',
      maxTokens: 1000000,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.002,
      features: ['chat', 'completion', 'vision', 'audio'],
      contextWindow: 1000000,
      knowledgeCutoff: '2024-02',
      description: 'Advanced model with massive context window and multimodal capabilities',
      capabilities: ['Long-form analysis', 'Code generation', 'Multimodal understanding', 'Complex reasoning'],
    },
    {
      id: 'gemini-1.5-pro-vision',
      name: 'Gemini 1.5 Pro Vision',
      provider: 'google',
      maxTokens: 1000000,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.002,
      features: ['chat', 'completion', 'vision', 'audio', 'image-generation'],
      contextWindow: 1000000,
      knowledgeCutoff: '2024-02',
      description: 'Specialized vision model with advanced image understanding',
      capabilities: ['Image analysis', 'Visual reasoning', 'Multimodal tasks', 'Image generation'],
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'google',
      maxTokens: 32768,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.002,
      features: ['chat', 'completion', 'vision'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Versatile model for general-purpose tasks',
      capabilities: ['Content generation', 'Programming', 'Analysis', 'Creative writing'],
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      provider: 'google',
      maxTokens: 32768,
      inputCostPer1k: 0.001,
      outputCostPer1k: 0.002,
      features: ['chat', 'completion', 'vision'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Vision-specialized model for image understanding',
      capabilities: ['Image analysis', 'Visual tasks', 'Multimodal interaction', 'Visual reasoning'],
    },
  ],
  groq: [
    {
      id: 'mixtral-8x7b',
      name: 'Mixtral 8x7B',
      provider: 'groq',
      maxTokens: 32768,
      inputCostPer1k: 0.0027,
      outputCostPer1k: 0.0027,
      features: ['chat', 'completion'],
      contextWindow: 32768,
      knowledgeCutoff: '2023-09',
      description: 'High-performance open model with extremely fast inference',
      capabilities: ['General writing', 'Code generation', 'Analysis', 'Creative tasks'],
    },
    {
      id: 'llama2-70b',
      name: 'LLaMA 2 70B',
      provider: 'groq',
      maxTokens: 4096,
      inputCostPer1k: 0.0027,
      outputCostPer1k: 0.0027,
      features: ['chat', 'completion'],
      contextWindow: 4096,
      knowledgeCutoff: '2023-07',
      description: 'Large open-source model with broad capabilities',
      capabilities: ['General tasks', 'Programming', 'Analysis', 'Content generation'],
    },
    {
      id: 'gemma-7b',
      name: 'Gemma 7B',
      provider: 'groq',
      maxTokens: 8192,
      inputCostPer1k: 0.0027,
      outputCostPer1k: 0.0027,
      features: ['chat', 'completion'],
      contextWindow: 8192,
      knowledgeCutoff: '2024-02',
      description: 'Efficient open model from Google',
      capabilities: ['General writing', 'Basic coding', 'Analysis', 'Content creation'],
    },
  ],
  mistral: [
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'mistral',
      maxTokens: 32768,
      inputCostPer1k: 0.002,
      outputCostPer1k: 0.006,
      features: ['chat', 'completion'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Most capable Mistral model for complex tasks',
      capabilities: ['Advanced reasoning', 'Code generation', 'Analysis', 'Creative writing'],
    },
    {
      id: 'mistral-medium',
      name: 'Mistral Medium',
      provider: 'mistral',
      maxTokens: 32768,
      inputCostPer1k: 0.0007,
      outputCostPer1k: 0.002,
      features: ['chat', 'completion'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Balanced model for general tasks',
      capabilities: ['Content generation', 'Programming', 'Analysis', 'Translation'],
    },
    {
      id: 'mistral-small',
      name: 'Mistral Small',
      provider: 'mistral',
      maxTokens: 32768,
      inputCostPer1k: 0.0002,
      outputCostPer1k: 0.0006,
      features: ['chat', 'completion'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Cost-effective model for general-purpose tasks',
      capabilities: ['Content generation', 'Basic coding', 'Translation', 'Summarization'],
    },
    {
      id: 'mistral-embed',
      name: 'Mistral Embed',
      provider: 'mistral',
      maxTokens: 32768,
      inputCostPer1k: 0.0001,
      outputCostPer1k: 0.0001,
      features: ['embedding'],
      contextWindow: 32768,
      knowledgeCutoff: '2024-02',
      description: 'Specialized model for text embeddings',
      capabilities: ['Text embeddings', 'Semantic search', 'Document similarity', 'Content clustering'],
    },
  ],
};