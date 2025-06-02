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
import { requireAuth, notFound, errorHandler } from './middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Chat routes
router.post('/chat', handleChatRequest);
router.post('/chat/stream', handleStreamingChatRequest);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversation);
router.put('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);
router.post('/conversations/:id/messages', addMessage);

// File routes
router.post('/files/upload', uploadFile);
router.get('/files/:id', getFile);
router.delete('/files/:id', deleteFile);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Apply error handling middleware
router.use(notFound);
router.use(errorHandler);

export default router;