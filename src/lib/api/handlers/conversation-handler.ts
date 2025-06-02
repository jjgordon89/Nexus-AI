/**
 * Conversation API handlers
 * 
 * This module handles requests related to conversation management.
 */

import { Request, Response } from 'express';
import { ConversationRepository } from '../../db';
import { 
  CreateConversationSchema, 
  UpdateConversationSchema, 
  CreateMessageSchema 
} from '../types';

/**
 * Get all conversations for the current user
 */
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user?.id || 'demo-user';
    const conversations = await ConversationRepository.findByUserId(userId);
    
    return res.json({ 
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        model: conv.model,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      })) 
    });
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to retrieve conversations' 
    });
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(req: Request, res: Response) {
  try {
    // Validate request
    const data = CreateConversationSchema.parse(req.body);
    const userId = req.user?.id || 'demo-user';
    
    // Create conversation
    const conversation = await ConversationRepository.create(userId, data);
    
    return res.status(201).json({
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors
      });
    }
    
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to create conversation' 
    });
  }
}

/**
 * Get a single conversation with its messages
 */
export async function getConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verify ownership (in real app)
    // const userId = req.user?.id || 'demo-user';
    
    // Get conversation with messages
    const conversation = await ConversationRepository.getWithMessages(id);
    
    if (!conversation) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Conversation not found' 
      });
    }
    
    return res.json(conversation);
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to retrieve conversation' 
    });
  }
}

/**
 * Update a conversation
 */
export async function updateConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request
    const data = UpdateConversationSchema.parse(req.body);
    
    // Verify ownership (in real app)
    // const userId = req.user?.id || 'demo-user';
    
    // Update conversation
    const conversation = await ConversationRepository.update(id, data);
    
    return res.json({
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    });
  } catch (error) {
    console.error('Failed to update conversation:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors
      });
    }
    
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to update conversation' 
    });
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Verify ownership (in real app)
    // const userId = req.user?.id || 'demo-user';
    
    // Delete conversation
    await ConversationRepository.delete(id);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to delete conversation' 
    });
  }
}

/**
 * Add a message to a conversation
 */
export async function addMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Validate request
    const messageData = CreateMessageSchema.parse(req.body);
    
    // Verify ownership (in real app)
    // const userId = req.user?.id || 'demo-user';
    
    // Create message
    const message = {
      id: undefined,
      role: messageData.role,
      content: messageData.content,
      timestamp: new Date(),
      attachments: messageData.attachments,
    };
    
    const savedMessage = await ConversationRepository.addMessage(id, message);
    
    return res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Failed to add message:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.errors
      });
    }
    
    return res.status(500).json({ 
      error: 'Database Error', 
      message: 'Failed to add message' 
    });
  }
}