import { z } from 'zod';

export const MessageValidator = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message is too long (max 4000 characters)')
    .refine(
      (content) => !containsInjectionPatterns(content),
      {
        message: 'Message contains potentially harmful content',
      }
    ),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        type: z.string(),
        size: z.number().max(25 * 1024 * 1024, 'File size must be less than 25MB'),
      })
    )
    .optional(),
});

export const ConversationValidator = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title is too long (max 100 characters)'),
  model: z.string(),
});

// Helper function to detect potential injection patterns
function containsInjectionPatterns(content: string): boolean {
  // Check for common SQL injection patterns
  const sqlPatterns = [
    /'\s*OR\s*'1'\s*=\s*'1/i,
    /'\s*OR\s*1\s*=\s*1/i,
    /'\s*;\s*DROP\s+TABLE/i,
    /'\s*;\s*DELETE\s+FROM/i,
    /'\s*UNION\s+SELECT/i,
  ];

  // Check for potential prompt injection patterns
  const promptInjectionPatterns = [
    /ignore previous instructions/i,
    /disregard (previous|all) instructions/i,
    /ignore everything (above|before)/i,
    /you are now/i,
  ];

  // Check for potential XSS patterns
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /onload\s*=/i,
  ];

  // Combine all patterns
  const allPatterns = [...sqlPatterns, ...promptInjectionPatterns, ...xssPatterns];

  // Check if content matches any pattern
  return allPatterns.some(pattern => pattern.test(content));
}

export type MessageValidation = z.infer<typeof MessageValidator>;
export type ConversationValidation = z.infer<typeof ConversationValidator>;