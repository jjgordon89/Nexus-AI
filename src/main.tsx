import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from './components/ui/tooltip';
import { Providers } from './components/providers';
import { ErrorBoundary } from './components/error-boundary';
import { Loading } from './components/ui/loading';
import './index.css';

// Lazy load App component
const App = lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <TooltipProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
              <Loading size="lg\" text="Loading NexusAI\" center />
            </div>
          }>
            <App />
          </Suspense>
        </TooltipProvider>
      </Providers>
    </ErrorBoundary>
  </StrictMode>
);