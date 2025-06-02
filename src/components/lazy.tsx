import React, { Suspense } from 'react';
import { Loading } from './ui/loading';

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

// Lazy-loaded components
export const LazySettingsDialog = React.lazy(() => 
  import('./settings/settings-dialog').then(module => ({ default: module.SettingsDialog }))
);

export const LazyDocumentPreview = React.lazy(() =>
  import('./documents/document-preview').then(module => ({ default: module.DocumentPreview }))
);

export const LazyFilePreview = React.lazy(() =>
  import('./ui/file-preview').then(module => ({ default: module.FilePreview }))
);