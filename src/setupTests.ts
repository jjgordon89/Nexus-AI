// Setup file for Jest tests

// Add custom jest matchers
import '@testing-library/jest-dom';

// Mock the matchMedia function for responsive design testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL for file handling tests
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock crypto for nanoid
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    randomUUID: () => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  },
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock fetch API
global.fetch = jest.fn();

// Mock console.error to keep test output clean
// But store the original for debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out certain React warnings for cleaner test output
  if (
    args[0]?.includes?.('Warning:') &&
    (args[0].includes('React does not recognize the') ||
     args[0].includes('The tag') ||
     args[0].includes('Invalid DOM property'))
  ) {
    return;
  }
  originalConsoleError(...args);
};