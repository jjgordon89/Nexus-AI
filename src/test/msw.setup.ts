/**
 * Setup file for Mock Service Worker in the browser
 * 
 * This file initializes MSW for the browser environment.
 * It should be imported in development mode to mock API calls.
 */

import { worker } from './mocks/browser';

// Start the worker in development mode
export async function setupMSW() {
  if (process.env.NODE_ENV === 'development') {
    // Initialize the worker
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn on unhandled requests
    });
    
    console.log('[MSW] Mock Service Worker initialized for development mode.');
    
    // Return the worker for cleanup
    return worker;
  }
  
  return null;
}