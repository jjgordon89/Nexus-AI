import React, { Suspense } from 'react';
import { Loading } from './ui/loading';
import { LazyLoadWrapper, LazySettingsDialog, LazyDocumentPreview, LazyFilePreview } from './ui/lazy-load-wrapper';

// Lazy load wrapper component
export function LazyLoad({ 
  children,
  fallback = <Loading center text="Loading..." />
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Re-export lazy components
export {
  LazySettingsDialog,
  LazyDocumentPreview,
  LazyFilePreview
};

// Dynamically import AI providers
export const LazyOpenAIProvider = () => import('../lib/ai/providers/openai').then(module => module.OpenAIProvider);
export const LazyAnthropicProvider = () => import('../lib/ai/providers/anthropic').then(module => module.AnthropicProvider);
export const LazyGoogleProvider = () => import('../lib/ai/providers/google').then(module => module.GoogleProvider);
export const LazyMistralProvider = () => import('../lib/ai/providers/mistral').then(module => module.MistralProvider);
export const LazyGroqProvider = () => import('../lib/ai/providers/groq').then(module => module.GroqProvider);
export const LazyHuggingFaceProvider = () => import('../lib/ai/providers/huggingface').then(module => module.HuggingFaceProvider);