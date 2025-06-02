/**
 * API routes configuration
 * 
 * This module defines the routes for the API endpoints.
 */

import express from 'express';
import { handleChatRequest, handleStreamingChatRequest } from './handlers/chat-handler';
import {
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessage,
} from './handlers/conversation-handler';
import {
  uploadFile,
  getFile,
  deleteFile,
} from './handlers/file-handler';
import {
  getSettings,
  updateSettings,
} from './handlers/settings-handler';
import { 
  requireAuth, 
  notFound, 
  errorHandler, 
  rateLimit,
  validateRequest
} from './middleware';
import { 
  ChatRequestSchema, 
  CreateConversationSchema,
  UpdateConversationSchema,
  CreateMessageSchema,
  UpdateSettingsSchema 
} from './types';
import authRoutes from '../auth/auth-routes';

const router = express.Router();

// Auth routes (no authentication required)
router.use('/auth', authRoutes);

// Apply rate limiting to all routes
router.use(rateLimit(100, 60 * 1000)); // 100 requests per minute

// Health check endpoint (no authentication required)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply authentication middleware to protected routes
router.use(requireAuth);

// Chat routes - apply more strict rate limits
router.post(
  '/chat', 
  rateLimit(20, 60 * 1000), // 20 requests per minute for AI chat
  validateRequest(ChatRequestSchema),
  handleChatRequest
);

router.post(
  '/chat/stream', 
  rateLimit(20, 60 * 1000),
  validateRequest(ChatRequestSchema),
  handleStreamingChatRequest
);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', validateRequest(CreateConversationSchema), createConversation);
router.get('/conversations/:id', getConversation);
router.put('/conversations/:id', validateRequest(UpdateConversationSchema), updateConversation);
router.delete('/conversations/:id', deleteConversation);
router.post('/conversations/:id/messages', validateRequest(CreateMessageSchema), addMessage);

// File routes
router.post('/files/upload', uploadFile);
router.get('/files/:id', getFile);
router.delete('/files/:id', deleteFile);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', validateRequest(UpdateSettingsSchema), updateSettings);

// Apply error handling middleware
router.use(notFound);
router.use(errorHandler);

export default router;