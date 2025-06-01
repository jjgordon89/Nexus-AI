import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from './components/ui/tooltip';
import { Providers } from './components/providers';
import { ErrorBoundary } from './components/error-boundary';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Providers>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </Providers>
    </ErrorBoundary>
  </StrictMode>
);