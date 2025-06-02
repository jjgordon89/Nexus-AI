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

// Lazy-loaded settings components
export const LazySettingsDialog = React.lazy(() => 
  import('./settings/settings-dialog').then(module => ({ default: module.SettingsDialog }))
);

// Lazy-loaded document components
export const LazyDocumentPreview = React.lazy(() =>
  import('./documents/document-preview').then(module => ({ default: module.DocumentPreview }))
);

// Lazy-loaded file preview component
export const LazyFilePreview = React.lazy(() =>
  import('./ui/file-preview').then(module => ({ default: module.FilePreview }))
);

// Lazy-loaded settings sections
export const LazyAISettings = React.lazy(() => 
  import('./settings/sections/ai-settings').then(module => ({ default: module.AISettings }))
);

export const LazyAppearanceSettings = React.lazy(() => 
  import('./settings/sections/appearance-settings').then(module => ({ default: module.AppearanceSettings }))
);

export const LazyDataSettings = React.lazy(() => 
  import('./settings/sections/data-settings').then(module => ({ default: module.DataSettings }))
);

export const LazyNotificationSettings = React.lazy(() => 
  import('./settings/sections/notification-settings').then(module => ({ default: module.NotificationSettings }))
);

export const LazyAboutSettings = React.lazy(() => 
  import('./settings/sections/about-settings').then(module => ({ default: module.AboutSettings }))
);

export const LazyPrivacySettings = React.lazy(() => 
  import('./settings/sections/privacy-settings').then(module => ({ default: module.PrivacySettings }))
);

export const LazyProfileSettings = React.lazy(() => 
  import('./settings/sections/profile-settings').then(module => ({ default: module.ProfileSettings }))
);