import { nanoid } from 'nanoid';
import { Attachment } from '../types';

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
    const fileType = file.type;
    
    if (fileType === 'text/plain' || fileType === 'text/markdown' || fileType === 'application/json') {
      return this.readAsText(file);
    }
    
    if (fileType === 'text/csv') {
      const text = await this.readAsText(file);
      // Simple CSV parsing
      return text.split('\n').map(line => line.split(',').join('\t')).join('\n');
    }
    
    // For other file types, we'd need specialized libraries
    // For now, just return a placeholder
    return `[Content of ${file.name} (${file.type})]`;
  }
}