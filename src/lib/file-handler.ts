import { nanoid } from 'nanoid';
import { Attachment } from '../types';
import { DocumentProcessor } from './document-processor';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json'
];

export class FileHandler {
  private static documentProcessor = new DocumentProcessor();

  /**
   * Validates a file for size and type
   */
  static validateFile(file: File): { valid: boolean; message?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File size exceeds the maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: 'File type not supported. Please upload a text, markdown, PDF, Word, or CSV file.'
      };
    }

    return { valid: true };
  }

  /**
   * Creates an attachment object from a File
   */
  static async createAttachment(file: File): Promise<Attachment> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Create a URL for the file
    const url = URL.createObjectURL(file);

    return {
      id: nanoid(),
      name: file.name,
      type: file.type,
      size: file.size,
      url
    };
  }

  /**
   * Reads a file as text
   */
  static async readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Reads a file as data URL
   */
  static async readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Releases the URL for an attachment
   */
  static releaseAttachment(attachment: Attachment): void {
    if (attachment.url && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  }

  /**
   * Extracts text content from different file types
   */
  static async extractContent(file: File): Promise<string> {
    try {
      return await this.documentProcessor.processFile(file);
    } catch (error) {
      console.error('Error extracting content:', error);
      return `[Content extraction failed for ${file.name}]`;
    }
  }
}