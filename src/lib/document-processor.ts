import { AIProviderFactory } from './ai/factory';
import { useSettingsStore } from '../store/settings-store';
import { SUPPORTED_FILE_TYPES } from '../types/documents';
import createHttpError from 'http-errors';

export class DocumentProcessor {
  private maxFileSize = 25 * 1024 * 1024; // 25MB

  async processFile(file: File): Promise<string> {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw createHttpError(413, 'File size exceeds 25MB limit');
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.isSupportedFileType(extension)) {
      throw createHttpError(415, 'Unsupported file type');
    }

    try {
      const content = await this.extractContent(file);
      return content;
    } catch (error) {
      console.error('Error processing document:', error);
      throw createHttpError(500, 'Failed to process document');
    }
  }

  private isSupportedFileType(extension: string): boolean {
    return Object.values(SUPPORTED_FILE_TYPES).flat().includes(extension);
  }

  private async extractContent(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
      case 'md':
      case 'rtf':
        return this.extractTextContent(file);
      
      case 'pdf':
        return this.extractPDFContent(file);
      
      case 'doc':
      case 'docx':
        return this.extractWordContent(file);
      
      case 'csv':
        return this.extractCSVContent(file);
      
      default:
        throw createHttpError(415, 'Unsupported file type');
    }
  }

  private async extractTextContent(file: File): Promise<string> {
    const text = await file.text();
    return text;
  }

  private async extractPDFContent(file: File): Promise<string> {
    // PDF extraction would be implemented here
    // For now, return placeholder
    return `[PDF Content from ${file.name}]`;
  }

  private async extractWordContent(file: File): Promise<string> {
    // Word document extraction would be implemented here
    // For now, return placeholder
    return `[Word Content from ${file.name}]`;
  }

  private async extractCSVContent(file: File): Promise<string> {
    const text = await file.text();
    // Basic CSV parsing
    const rows = text.split('\n').map(row => row.split(','));
    return rows.map(row => row.join('\t')).join('\n');
  }

  async createEmbeddings(text: string): Promise<number[]> {
    const settings = useSettingsStore.getState().settings;
    const provider = AIProviderFactory.createProvider(
      settings.ai.model.split('-')[0],
      settings.ai.apiKey!
    );

    if ('createEmbedding' in provider) {
      return provider.createEmbedding(text);
    }

    throw new Error('Selected provider does not support embeddings');
  }
}