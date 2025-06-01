import { z } from 'zod';

export const MessageValidator = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message is too long (max 4000 characters)'),
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

export type MessageValidation = z.infer<typeof MessageValidator>;
export type ConversationValidation = z.infer<typeof ConversationValidator>;