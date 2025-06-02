/**
 * Message repository for database operations
 * 
 * This module provides functions for managing message records in the database.
 */

import { db } from '../client';
import { MessageRecord, MessageSchema } from '../schema';
import { nanoid } from 'nanoid';
import { Message, Attachment } from '../../../types';
import { AttachmentRepository } from './attachment-repository';

export class MessageRepository {
  /**
   * Create a new message
   */
  static async create(
    conversationId: string,
    message: Message
  ): Promise<Message> {
    const now = new Date().toISOString();
    
    const messageRecord: MessageRecord = {
      id: message.id || nanoid(),
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
    };
    
    // Validate the message data
    MessageSchema.parse(messageRecord);
    
    await db.insert('messages', messageRecord);
    
    // Save attachments if present
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        await AttachmentRepository.create(messageRecord.id, attachment);
      }
    }
    
    // Return the message in the application format
    return {
      id: messageRecord.id,
      role: messageRecord.role,
      content: messageRecord.content,
      timestamp: new Date(messageRecord.timestamp),
      attachments: message.attachments,
    };
  }

  /**
   * Find a message by ID
   */
  static async findById(id: string): Promise<MessageRecord | null> {
    const message = await db.findById('messages', id);
    return message ? MessageSchema.parse(message) : null;
  }

  /**
   * Find all messages for a conversation
   */
  static async findByConversationId(conversationId: string): Promise<MessageRecord[]> {
    const messages = await db.findBy('messages', 'conversation_id', conversationId);
    return messages.map(msg => MessageSchema.parse(msg));
  }

  /**
   * Update a message
   */
  static async update(id: string, data: Partial<Message>): Promise<MessageRecord> {
    const currentMessage = await this.findById(id);
    
    if (!currentMessage) {
      throw new Error(`Message with ID ${id} not found`);
    }
    
    const updatedMessage: MessageRecord = {
      ...currentMessage,
      content: data.content !== undefined ? data.content : currentMessage.content,
      role: data.role || currentMessage.role,
      timestamp: data.timestamp ? data.timestamp.toISOString() : currentMessage.timestamp,
    };
    
    // Validate the updated message data
    MessageSchema.parse(updatedMessage);
    
    await db.update('messages', id, {
      content: updatedMessage.content,
      role: updatedMessage.role,
      timestamp: updatedMessage.timestamp,
    });
    
    return updatedMessage;
  }

  /**
   * Delete a message
   */
  static async delete(id: string): Promise<void> {
    // The database will cascade delete all attachments
    await db.delete('messages', id);
  }

  /**
   * Get a message with its attachments
   */
  static async getWithAttachments(id: string): Promise<Message | null> {
    const message = await this.findById(id);
    
    if (!message) {
      return null;
    }
    
    const attachmentRecords = await AttachmentRepository.findByMessageId(id);
    
    // Convert from database records to application types
    const attachments: Attachment[] = attachmentRecords.map(att => ({
      id: att.id,
      name: att.name,
      type: att.type,
      size: att.size,
      url: att.path,
    }));
    
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: new Date(message.timestamp),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
  }
}