import { z } from 'zod';

const DocumentPermissionSchema = z.enum(['private', 'public', 'shared']);
const DocumentTypeSchema = z.enum(['text', 'markdown', 'code', 'pdf', 'image']);
const DocumentStatusSchema = z.enum(['draft', 'published', 'archived']);
const DocumentTemplateSchema = z.enum(['blank', 'report', 'contract', 'letter']);

const DocumentVersionSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.date(),
  createdBy: z.string(),
  comment: z.string().optional(),
  hash: z.string(),
  size: z.number(),
});

const DocumentMetadataSchema = z.object({
  author: z.string(),
  department: z.string().optional(),
  keywords: z.array(z.string()),
  language: z.string().default('en'),
  template: DocumentTemplateSchema.optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});

const DocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: DocumentTypeSchema,
  status: DocumentStatusSchema.default('draft'),
  permission: DocumentPermissionSchema,
  tags: z.array(z.string()),
  size: z.number(),
  ownerId: z.string(),
  sharedWith: z.array(z.string()),
  versions: z.array(DocumentVersionSchema),
  metadata: DocumentMetadataSchema,
  retentionPeriod: z.number().optional(), // Days until document expires
  expiresAt: z.date().optional(),
  isArchived: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  parentId: z.string().optional(), // For document hierarchy
  path: z.string(), // Document location in hierarchy
  searchableContent: z.string(), // Indexed content for search
});

const DocumentSearchFiltersSchema = z.object({
  type: DocumentTypeSchema.optional(),
  status: DocumentStatusSchema.optional(),
  permission: DocumentPermissionSchema.optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  ownerId: z.string().optional(),
  isArchived: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  path: z.string().optional(),
  template: DocumentTemplateSchema.optional(),
});

type DocumentPermission = z.infer<typeof DocumentPermissionSchema>;
type DocumentType = z.infer<typeof DocumentTypeSchema>;
type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
type DocumentTemplate = z.infer<typeof DocumentTemplateSchema>;
type DocumentVersion = z.infer<typeof DocumentVersionSchema>;
type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
type Document = z.infer<typeof DocumentSchema>;
type DocumentSearchFilters = z.infer<typeof DocumentSearchFiltersSchema>;

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VERSIONS_TO_KEEP = 10;
export const SUPPORTED_FILE_TYPES = {
  text: ['txt', 'md', 'rtf'],
  code: ['js', 'ts', 'json', 'html', 'css', 'py'],
  document: ['pdf', 'doc', 'docx'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

const DOCUMENT_TEMPLATES = {
  blank: {
    title: 'Blank Document',
    content: '',
    type: 'text' as DocumentType,
  },
  report: {
    title: 'Report Template',
    content: '# Report Title\n\n## Executive Summary\n\n## Introduction\n\n## Findings\n\n## Recommendations\n\n## Conclusion',
    type: 'markdown' as DocumentType,
  },
  contract: {
    title: 'Contract Template',
    content: '# Contract Agreement\n\n## Parties\n\n## Terms and Conditions\n\n## Signatures',
    type: 'markdown' as DocumentType,
  },
  letter: {
    title: 'Business Letter',
    content: '# [Your Company]\n\nDate: [Date]\n\nDear [Recipient],\n\n[Body]\n\nSincerely,\n[Your Name]',
    type: 'markdown' as DocumentType,
  },
};

const RETENTION_POLICIES = {
  temporary: 30, // 30 days
  short: 90, // 90 days
  medium: 365, // 1 year
  long: 730, // 2 years
  permanent: -1, // Never expires
};

const DOCUMENT_NAMING_CONVENTION = {
  pattern: /^[a-zA-Z0-9-_]+$/,
  maxLength: 200,
  reservedNames: ['temp', 'draft', 'copy', 'backup'],
};