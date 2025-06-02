// Jest setup file

/**
 * This runs before Jest is loaded
 */

// Initialize MSW for API mocking
import { server } from './mocks/server';

// Mock service worker
beforeAll(() => {
  // Start the server before all tests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset any request handlers that we may add during the tests
  server.resetHandlers();
});

afterAll(() => {
  // Close server when done
  server.close();
});