/**
 * Test utilities for React component testing
 * 
 * This module provides helper functions for testing React components.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'next-themes';
import { ErrorProvider } from '../components/ui/error-provider';
import { LoadingProvider } from '../components/ui/loading-provider';
import { TooltipProvider } from '../components/ui/tooltip';
import { AuthProvider } from '../lib/auth/auth-provider';

/**
 * Custom render function that wraps components with necessary providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ErrorProvider>
          <LoadingProvider>
            <AuthProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </AuthProvider>
          </LoadingProvider>
        </ErrorProvider>
      </ThemeProvider>
    ),
    ...options,
  });
}

/**
 * Setup user event for testing interactions
 */
function setup(jsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...customRender(jsx),
  };
}

// Export everything from react-testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render, setup };