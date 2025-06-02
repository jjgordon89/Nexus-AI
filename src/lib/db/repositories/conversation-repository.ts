/**
 * Conversation repository for database operations
 * 
 * This module provides functions for managing conversation records in the database.
 */

import { db } from '../client';
import { ConversationRecord, ConversationSchema } from '../schema';
import { nanoid } from 'nanoid';
import { Conversation, Message } from '../../../types';
import { MessageRepository } from './message-repository';

export class ConversationRepository {
  /**
   * Create a new conversation
   */
  static async create(
    userId: string,
    data: Pick<Conversation, 'title' | 'model'>
  ): Promise<ConversationRecord> {
    const now = new Date().toISOString();
    
    const conversation: ConversationRecord = {
      id: nanoid(),
      user_id: userId,
      title: data.title,
      model: data.model,
      created_at: now,
      updated_at: now,
    };
    
    // Validate the conversation data
    ConversationSchema.parse(conversation);
    
    await db.insert('conversations', conversation);
    
    return conversation;
  }

  /**
   * Find a conversation by ID
   */
  static async findById(id: string): Promise<ConversationRecord | null> {
    const conversation = await db.findById('conversations', id);
    return conversation ? ConversationSchema.parse(conversation) : null;
  }

  /**
   * Find all conversations for a user
   */
  static async findByUserId(userId: string): Promise<ConversationRecord[]> {
    const conversations = await db.findBy('conversations', 'user_id', userId);
    return conversations.map(conv => ConversationSchema.parse(conv));
  }

  /**
   * Update a conversation
   */
  static async update(id: string, data: Partial<Conversation>): Promise<ConversationRecord> {
    const currentConversation = await this.findById(id);
    
    if (!currentConversation) {
      throw new Error(`Conversation with ID ${id} not found`);
    }
    
    const updatedConversation: ConversationRecord = {
      ...currentConversation,
      title: data.title || currentConversation.title,
      model: data.model || currentConversation.model,
      updated_at: new Date().toISOString(),
    };
    
    // Validate the updated conversation data
    ConversationSchema.parse(updatedConversation);
    
    await db.update('conversations', id, {
      title: updatedConversation.title,
      model: updatedConversation.model,
      updated_at: updatedConversation.updated_at,
    });
    
    return updatedConversation;
  }

  /**
   * Delete a conversation and all its messages
   */
  static async delete(id: string): Promise<void> {
    // The database will cascade delete all messages and attachments
    await db.delete('conversations', id);
  }

  /**
   * Get a full conversation with its messages
   */
  static async getWithMessages(id: string): Promise<Conversation | null> {
    const conversation = await this.findById(id);
    
    if (!conversation) {
      return null;
    }
    
    const messages = await MessageRepository.findByConversationId(id);
    
    // Convert from database schema to application schema
    return {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      createdAt: new Date(conversation.created_at),
      updatedAt: new Date(conversation.updated_at),
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
    };
  }

  /**
   * Add a message to a conversation
   */
  static async addMessage(conversationId: string, message: Message): Promise<Message> {
    const savedMessage = await MessageRepository.create(conversationId, message);
    
    // Update the conversation's updated_at timestamp
    await this.update(conversationId, {});
    
    return savedMessage;
  }
}