import { AIProviderFactory } from './ai/factory';
import { useSettingsStore } from '../store/settings-store';
import { SUPPORTED_FILE_TYPES } from '../types/documents';

export class DocumentProcessor {
  private maxFileSize = 25 * 1024 * 1024; // 25MB

  async processFile(file: File): Promise<string> {
    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new Error('File size exceeds 25MB limit');
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.isSupportedFileType(extension)) {
      throw new Error('Unsupported file type');
    }

    try {
      const content = await this.extractContent(file);
      return content;
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
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
      
      case 'json':
        return this.extractJSONContent(file);
        
      default:
        throw new Error('Unsupported file type');
    }
  }

  private async extractTextContent(file: File): Promise<string> {
    return await file.text();
  }

  private async extractPDFContent(file: File): Promise<string> {
    // In a full implementation, we would use a PDF extraction library
    // For now, we'll return a simplified version indicating the PDF content
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2);
    return `[PDF Document: ${fileName} (${fileSize} KB)]`;
  }

  private async extractWordContent(file: File): Promise<string> {
    // In a full implementation, we would use a Word document extraction library
    // For now, we'll return a simplified version indicating the Word content
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2);
    return `[Word Document: ${fileName} (${fileSize} KB)]`;
  }

  private async extractCSVContent(file: File): Promise<string> {
    const text = await file.text();
    // Basic CSV parsing to create a table representation
    const rows = text.split('\n').map(row => row.split(','));
    const formattedRows = rows.map(row => row.join('\t')).join('\n');
    return `CSV Data from ${file.name}:\n\n${formattedRows}`;
  }
  
  private async extractJSONContent(file: File): Promise<string> {
    const text = await file.text();
    try {
      // Try to parse and format the JSON
      const json = JSON.parse(text);
      return `JSON Data from ${file.name}:\n\n${JSON.stringify(json, null, 2)}`;
    } catch (e) {
      // If parsing fails, return the raw text
      return text;
    }
  }

  async createEmbeddings(text: string): Promise<number[]> {
    const settings = useSettingsStore.getState().settings;
    const provider = AIProviderFactory.createProvider(
      settings.ai.provider,
      settings.ai.apiKey || '',
      settings.ai.baseUrl
    );

    if ('createEmbedding' in provider && typeof provider.createEmbedding === 'function') {
      return await provider.createEmbedding(text);
    }

    throw new Error('Selected provider does not support embeddings');
  }
}