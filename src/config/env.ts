/**
 * Environment variables configuration
 * 
 * This file centralizes access to environment variables with proper typing
 * and fallback values. It also provides documentation for each variable.
 */

/**
 * Interface for API provider keys
 */
interface ApiKeys {
  openai: string | undefined;
  google: string | undefined;
  anthropic: string | undefined;
  mistral: string | undefined;
  groq: string | undefined;
  huggingface: string | undefined;
}

/**
 * Interface for analytics configuration
 */
interface AnalyticsConfig {
  enabled: boolean;
  id: string | undefined;
}

/**
 * Interface for error tracking configuration
 */
interface ErrorTrackingConfig {
  enabled: boolean;
  dsn: string | undefined;
}

/**
 * Interface for application configuration
 */
interface AppConfig {
  name: string;
  version: string;
  apiTimeout: number;
  maxFileSizeMB: number;
}

/**
 * Main configuration interface
 */
export interface Config {
  api: ApiKeys;
  apiBaseUrls: {
    openai: string | undefined;
  };
  analytics: AnalyticsConfig;
  errorTracking: ErrorTrackingConfig;
  app: AppConfig;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Gets a boolean value from environment variable
 * 
 * @param value - The environment variable string value
 * @param defaultValue - Default value if not set
 * @returns boolean
 */
const getBooleanValue = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Gets a number value from environment variable
 * 
 * @param value - The environment variable string value
 * @param defaultValue - Default value if not set or invalid
 * @returns number
 */
const getNumberValue = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Application configuration object
 * 
 * Centralizes all environment variables with proper typing and fallback values
 */
export const config: Config = {
  api: {
    openai: import.meta.env.VITE_OPENAI_API_KEY,
    google: import.meta.env.VITE_GOOGLE_API_KEY,
    anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
    mistral: import.meta.env.VITE_MISTRAL_API_KEY,
    groq: import.meta.env.VITE_GROQ_API_KEY,
    huggingface: import.meta.env.VITE_HUGGINGFACE_API_KEY,
  },
  apiBaseUrls: {
    openai: import.meta.env.VITE_OPENAI_BASE_URL,
  },
  analytics: {
    enabled: getBooleanValue(import.meta.env.VITE_ENABLE_ANALYTICS, false),
    id: import.meta.env.VITE_ANALYTICS_ID,
  },
  errorTracking: {
    enabled: getBooleanValue(import.meta.env.VITE_ENABLE_ERROR_TRACKING, false),
    dsn: import.meta.env.VITE_SENTRY_DSN,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'NexusAI',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    apiTimeout: getNumberValue(import.meta.env.VITE_API_TIMEOUT_MS, 30000),
    maxFileSizeMB: getNumberValue(import.meta.env.VITE_MAX_FILE_SIZE_MB, 25),
  },
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

/**
 * Gets an API key for the specified provider
 * 
 * @param provider - The AI provider name
 * @returns The API key or undefined if not set
 */
export function getApiKey(provider: keyof ApiKeys): string | undefined {
  return config.api[provider];
}

/**
 * Gets the base URL for a provider (if customized)
 * 
 * @param provider - The provider name
 * @returns The base URL or undefined
 */
export function getApiBaseUrl(provider: 'openai'): string | undefined {
  return config.apiBaseUrls[provider];
}

/**
 * Checks if analytics is enabled and configured
 * 
 * @returns Whether analytics should be used
 */
export function isAnalyticsEnabled(): boolean {
  return config.analytics.enabled && !!config.analytics.id;
}

/**
 * Checks if error tracking is enabled and configured
 * 
 * @returns Whether error tracking should be used
 */
export function isErrorTrackingEnabled(): boolean {
  return config.errorTracking.enabled && !!config.errorTracking.dsn;
}

/**
 * Gets the maximum file size in bytes
 * 
 * @returns Maximum file size in bytes
 */
export function getMaxFileSize(): number {
  return config.app.maxFileSizeMB * 1024 * 1024;
}