/**
 * Attachment repository for database operations
 * 
 * This module provides functions for managing attachment records in the database.
 */

import { db } from '../client';
import { AttachmentRecord, AttachmentSchema } from '../schema';
import { nanoid } from 'nanoid';
import { Attachment } from '../../../types';

export class AttachmentRepository {
  /**
   * Create a new attachment
   */
  static async create(
    messageId: string,
    attachment: Attachment
  ): Promise<AttachmentRecord> {
    const now = new Date().toISOString();
    
    const attachmentRecord: AttachmentRecord = {
      id: attachment.id || nanoid(),
      message_id: messageId,
      name: attachment.name,
      type: attachment.type,
      size: attachment.size,
      path: attachment.url || '',
      created_at: now,
    };
    
    // Validate the attachment data
    AttachmentSchema.parse(attachmentRecord);
    
    await db.insert('attachments', attachmentRecord);
    
    return attachmentRecord;
  }

  /**
   * Find an attachment by ID
   */
  static async findById(id: string): Promise<AttachmentRecord | null> {
    const attachment = await db.findById('attachments', id);
    return attachment ? AttachmentSchema.parse(attachment) : null;
  }

  /**
   * Find all attachments for a message
   */
  static async findByMessageId(messageId: string): Promise<AttachmentRecord[]> {
    const attachments = await db.findBy('attachments', 'message_id', messageId);
    return attachments.map(att => AttachmentSchema.parse(att));
  }

  /**
   * Update an attachment
   */
  static async update(id: string, data: Partial<Attachment>): Promise<AttachmentRecord> {
    const currentAttachment = await this.findById(id);
    
    if (!currentAttachment) {
      throw new Error(`Attachment with ID ${id} not found`);
    }
    
    const updatedAttachment: AttachmentRecord = {
      ...currentAttachment,
      name: data.name || currentAttachment.name,
      type: data.type || currentAttachment.type,
      size: data.size || currentAttachment.size,
      path: data.url || currentAttachment.path,
    };
    
    // Validate the updated attachment data
    AttachmentSchema.parse(updatedAttachment);
    
    await db.update('attachments', id, {
      name: updatedAttachment.name,
      type: updatedAttachment.type,
      size: updatedAttachment.size,
      path: updatedAttachment.path,
    });
    
    return updatedAttachment;
  }

  /**
   * Delete an attachment
   */
  static async delete(id: string): Promise<void> {
    await db.delete('attachments', id);
  }

  /**
   * Convert an attachment record to the application type
   */
  static toAttachment(record: AttachmentRecord): Attachment {
    return {
      id: record.id,
      name: record.name,
      type: record.type,
      size: record.size,
      url: record.path,
    };
  }
}