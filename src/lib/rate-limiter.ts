import { AIError } from './ai/error';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  provider: string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  lastRequest: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitInfo>;
  private configs: Map<string, RateLimitConfig>;

  private constructor() {
    this.limits = new Map();
    this.configs = new Map([
      ['openai', { maxRequests: 50, windowMs: 60000, provider: 'openai' }],
      ['anthropic', { maxRequests: 50, windowMs: 60000, provider: 'anthropic' }],
      ['google', { maxRequests: 60, windowMs: 60000, provider: 'google' }],
      ['mistral', { maxRequests: 50, windowMs: 60000, provider: 'mistral' }],
      ['groq', { maxRequests: 100, windowMs: 60000, provider: 'groq' }],
    ]);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  async checkLimit(provider: string, key: string): Promise<void> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new AIError(`Unknown provider: ${provider}`);
    }

    const now = Date.now();
    const limitKey = `${provider}:${key}`;
    const limitInfo = this.limits.get(limitKey);

    if (!limitInfo || now >= limitInfo.resetTime) {
      this.limits.set(limitKey, {
        count: 1,
        resetTime: now + config.windowMs,
        lastRequest: now,
      });
      return;
    }

    // Check minimum interval between requests (100ms)
    const timeSinceLastRequest = now - limitInfo.lastRequest;
    if (timeSinceLastRequest < 100) {
      await new Promise(resolve => setTimeout(resolve, 100 - timeSinceLastRequest));
    }

    if (limitInfo.count >= config.maxRequests) {
      const waitTime = limitInfo.resetTime - now;
      throw new AIError(
        `Rate limit exceeded for ${provider}. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    limitInfo.count++;
    limitInfo.lastRequest = now;
  }

  getRemainingRequests(provider: string, key: string): number {
    const config = this.configs.get(provider);
    if (!config) return 0;

    const now = Date.now();
    const limitKey = `${provider}:${key}`;
    const limitInfo = this.limits.get(limitKey);

    if (!limitInfo || now >= limitInfo.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - limitInfo.count);
  }

  getResetTime(provider: string, key: string): number | null {
    const limitKey = `${provider}:${key}`;
    const limitInfo = this.limits.get(limitKey);
    return limitInfo ? limitInfo.resetTime : null;
  }

  clearLimit(provider: string, key: string): void {
    const limitKey = `${provider}:${key}`;
    this.limits.delete(limitKey);
  }

  clearAllLimits(): void {
    this.limits.clear();
  }
}