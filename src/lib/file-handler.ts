import { nanoid } from 'nanoid';
import { Attachment } from '../types';
import { DocumentProcessor } from './document-processor';

/**
 * Maximum allowed file size in bytes (25MB)
 */
const MAX_FILE_SIZE = 25 * 1024 * 1024; 

/**
 * List of file types that are allowed for upload
 */
const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json'
];

/**
 * Utility class for handling file operations in the application
 * 
 * Responsibilities:
 * - File validation (size, type)
 * - Creating attachment objects
 * - Reading file contents
 * - Managing blob URLs
 * - Extracting text from various file types
 */
export class FileHandler {
  private static documentProcessor = new DocumentProcessor();

  /**
   * Validates a file for size and type
   * 
   * @param file - The file to validate
   * @returns Object containing validation result and optional error message
   */
  static validateFile(file: File): { valid: boolean; message?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File size exceeds the maximum limit of ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
      };
    }

    // Check file type
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
   * 
   * @param file - The file to create an attachment from
   * @returns Promise resolving to an Attachment object
   * @throws Error if file validation fails
   */
  static async createAttachment(file: File): Promise<Attachment> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Create a blob URL for the file
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
   * 
   * @param file - The file to read
   * @returns Promise resolving to the file contents as string
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
   * Reads a file as ArrayBuffer
   * 
   * @param file - The file to read
   * @returns Promise resolving to the file contents as ArrayBuffer
   */
  static async readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Reads a file as data URL
   * 
   * @param file - The file to read
   * @returns Promise resolving to the file contents as data URL
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
   * Important to call this when attachments are no longer needed
   * to prevent memory leaks
   * 
   * @param attachment - The attachment to release
   */
  static releaseAttachment(attachment: Attachment): void {
    if (attachment.url && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
  }

  /**
   * Extracts text content from different file types
   * Delegates to DocumentProcessor for specific file type processing
   * 
   * @param file - The file to extract content from
   * @returns Promise resolving to the extracted text content
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