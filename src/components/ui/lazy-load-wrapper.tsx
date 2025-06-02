import React, { Suspense, lazy, ComponentType } from 'react';
import { Loading } from './loading';

interface LazyLoadWrapperProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

/**
 * Component for lazily loading other components
 * 
 * This component provides a standardized way to lazily load components
 * with a consistent loading UI and error handling.
 */
export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  loader,
  fallback = <Loading center text="Loading..." />,
  props = {},
}) => {
  const LazyComponent = lazy(loader);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Predefined lazy component loaders
export const LazyVirtualizedMessageList = (props: any) => (
  <LazyLoadWrapper
    loader={() => import('../chat/virtualized-message-list').then(module => ({ default: module.VirtualizedMessageList }))}
    props={props}
    fallback={<Loading text="Loading message list..." center />}
  />
);

export const LazySettingsDialog = (props: any) => (
  <LazyLoadWrapper
    loader={() => import('../settings/settings-dialog').then(module => ({ default: module.SettingsDialog }))}
    props={props}
    fallback={
      <div className="flex items-center justify-center h-[500px]">
        <Loading text="Loading settings..." />
      </div>
    }
  />
);

export const LazyFilePreview = (props: any) => (
  <LazyLoadWrapper
    loader={() => import('./file-preview').then(module => ({ default: module.FilePreview }))}
    props={props}
    fallback={
      <div className="p-8 bg-muted/30 rounded-md flex justify-center">
        <Loading text="Loading preview..." />
      </div>
    }
  />
);

export const LazyDocumentPreview = (props: any) => (
  <LazyLoadWrapper
    loader={() => import('../documents/document-preview').then(module => ({ default: module.DocumentPreview }))}
    props={props}
  />
);