import { z } from 'zod';

const AIProviderSchema = z.enum([
  'openai',
  'anthropic',
  'google',
  'groq',
  'mistral',
  'openai-compatible'
]);

const AIModelSchema = z.enum([
  'gpt-4',
  'gpt-3.5-turbo',
  'gemini-1.5-pro',
  'mixtral-8x7b',
  'mistral-large',
  'mistral-small',
  'claude-3-opus',
  'claude-3-sonnet'
]);

const EmbeddingModelSchema = z.enum([
  'text-embedding-3-small',
  'text-embedding-3-large',
  'mistral-embed',
  'all-MiniLM-L6-v2'
]);

const ThemeSchema = z.enum(['light', 'dark', 'system']);
const LanguageSchema = z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh']);
const NotificationTypeSchema = z.enum(['all', 'mentions', 'none']);
const DataRetentionSchema = z.enum(['30days', '90days', '1year', 'forever']);

/**
 * User settings schema with validation
 */
export const UserSettingsSchema = z.object({
  profile: z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    avatar: z.string().url().optional(),
    bio: z.string().max(200).optional(),
  }),
  
  ai: z.object({
    provider: AIProviderSchema.default('openai'),
    model: AIModelSchema.default('gpt-4'),
    apiKey: z.string().min(1).optional(),
    baseUrl: z.string().url().optional(),
    temperature: z.number().min(0).max(1).default(0.7),
    maxTokens: z.number().min(1).max(32000).default(2000),
    systemMessage: z.string().optional(),
    streamResponses: z.boolean().default(true),
    embeddingModel: EmbeddingModelSchema.default('text-embedding-3-small'),
    embeddingDimensions: z.number().default(1536),
    embeddingQuality: z.number().min(0).max(1).default(0.5),
    batchProcessing: z.boolean().default(false),
  }),
  
  appearance: z.object({
    theme: ThemeSchema.default('system'),
    language: LanguageSchema.default('en'),
    fontSize: z.number().min(12).max(24).default(16),
    reducedMotion: z.boolean().default(false),
    highContrast: z.boolean().default(false),
  }),
  
  privacy: z.object({
    dataSharing: z.boolean().default(true),
    analyticsEnabled: z.boolean().default(true),
    historyEnabled: z.boolean().default(true),
    dataRetention: DataRetentionSchema.default('90days'),
  }),
  
  notifications: z.object({
    enabled: z.boolean().default(true),
    type: NotificationTypeSchema.default('all'),
    sound: z.boolean().default(true),
    volume: z.number().min(0).max(100).default(50),
    doNotDisturb: z.boolean().default(false),
    doNotDisturbStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    doNotDisturbEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  }),
  
  data: z.object({
    autoSave: z.boolean().default(true),
    backupEnabled: z.boolean().default(false),
    backupFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    storageLimit: z.number().min(100).max(10000).default(1000),
  }),
});

/**
 * Type definitions derived from Zod schemas
 */
export type AIProvider = z.infer<typeof AIProviderSchema>;
export type AIModel = z.infer<typeof AIModelSchema>;
export type EmbeddingModel = z.infer<typeof EmbeddingModelSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export type DataRetention = z.infer<typeof DataRetentionSchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;