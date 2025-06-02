import { AIProviderFactory } from './ai/factory';
import { useSettingsStore } from '../store/settings-store';
import { SUPPORTED_FILE_TYPES } from '../types/documents';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as docx from 'docx';

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export class DocumentProcessor {
  private maxFileSize = 25 * 1024 * 1024; // 25MB
  private maxPagesToProcess = 50; // Limit for PDF processing
  private maxWordContentLength = 100000; // Limit for Word document content

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
    try {
      // Convert the file to an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load the PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Get the total number of pages
      const numPages = pdf.numPages;
      const pagesToProcess = Math.min(numPages, this.maxPagesToProcess);
      
      let extractedText = `PDF Document: ${file.name} (${numPages} pages)\n\n`;
      
      // Extract text from each page
      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract the text items and join them
        const pageText = textContent.items
          .filter(item => 'str' in item)
          .map(item => ('str' in item) ? item.str : '')
          .join(' ');
          
        extractedText += `Page ${i}:\n${pageText}\n\n`;
      }
      
      // Add a note if we didn't process all pages
      if (pagesToProcess < numPages) {
        extractedText += `\n[Note: Only the first ${pagesToProcess} pages were processed due to size constraints.]\n`;
      }
      
      return extractedText;
    } catch (error) {
      console.error('PDF extraction error:', error);
      
      // Fallback to simplified info if extraction fails
      const fileSize = (file.size / 1024).toFixed(2);
      return `[PDF Document: ${file.name} (${fileSize} KB) - Content extraction failed. The PDF might be encrypted, damaged, or contain only images.]`;
    }
  }

  private async extractWordContent(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Check file extension to determine which library to use
      if (file.name.endsWith('.docx')) {
        // For .docx files, use mammoth.js
        const result = await mammoth.extractRawText({ arrayBuffer });
        let extractedText = result.value;
        
        // Trim if it's too large
        if (extractedText.length > this.maxWordContentLength) {
          extractedText = extractedText.substring(0, this.maxWordContentLength) + 
            '\n\n[Content truncated due to size limitations...]';
        }
        
        return `Word Document: ${file.name}\n\n${extractedText}`;
      } else if (file.name.endsWith('.doc')) {
        // For .doc files, use alternative approach
        // Since direct .doc parsing is limited in browser, provide useful info
        try {
          // Try to use docx to open it (might work for some .doc files)
          const document = await docx.read(arrayBuffer);
          const text = docx.utils.extractText(document);
          return `Word Document (.doc): ${file.name}\n\n${text}`;
        } catch (e) {
          const fileSize = (file.size / 1024).toFixed(2);
          return `Word Document (.doc): ${file.name} (${fileSize} KB)\n\n` +
            `[Legacy .doc format - limited content extraction available in browser. For best results, consider converting to .docx]`;
        }
      }
      
      // Fallback for unknown Word format
      const fileSize = (file.size / 1024).toFixed(2);
      return `Word Document: ${file.name} (${fileSize} KB)`;
    } catch (error) {
      console.error('Word extraction error:', error);
      
      // Fallback to simplified info if extraction fails
      const fileSize = (file.size / 1024).toFixed(2);
      return `[Word Document: ${file.name} (${fileSize} KB) - Content extraction failed.]`;
    }
  }

  private async extractCSVContent(file: File): Promise<string> {
    const text = await file.text();
    
    try {
      // Parse CSV into rows and columns
      const rows = text.split('\n').map(row => row.split(','));
      
      // Get header row
      const headers = rows[0] || [];
      
      // Build a formatted table
      let formattedContent = `CSV Data: ${file.name}\n\n`;
      
      // Format headers
      formattedContent += headers.map(header => `| ${header.trim()} `).join('') + '|\n';
      
      // Add separator line
      formattedContent += headers.map(() => '| --- ').join('') + '|\n';
      
      // Format data rows (limit to 100 rows for large files)
      const maxRows = Math.min(rows.length - 1, 100);
      for (let i = 1; i <= maxRows; i++) {
        if (rows[i].length > 0 && rows[i][0].trim() !== '') {
          formattedContent += rows[i].map(cell => `| ${cell.trim()} `).join('') + '|\n';
        }
      }
      
      // Add note if we truncated rows
      if (rows.length - 1 > maxRows) {
        formattedContent += `\n[Note: Only showing ${maxRows} out of ${rows.length - 1} rows due to size constraints.]\n`;
      }
      
      return formattedContent;
    } catch (e) {
      // If parsing fails, return the raw text with a note
      return `CSV Data from ${file.name} (parsing error - showing raw content):\n\n${text}`;
    }
  }
  
  private async extractJSONContent(file: File): Promise<string> {
    const text = await file.text();
    try {
      // Try to parse and format the JSON
      const json = JSON.parse(text);
      
      // Determine if this is a large JSON file
      const formattedJson = JSON.stringify(json, null, 2);
      
      if (formattedJson.length > 10000) {
        // For large JSON files, show a summary instead of the full content
        const keys = Object.keys(json);
        let summary = `JSON Data: ${file.name} (large file)\n\n`;
        
        // If it's an array, show info about the array
        if (Array.isArray(json)) {
          summary += `Array with ${json.length} items.\n\n`;
          
          // Show example of first few items
          if (json.length > 0) {
            summary += `Example items:\n\`\`\`json\n${JSON.stringify(json.slice(0, 3), null, 2)}\n`;
            if (json.length > 3) summary += "...\n";
            summary += `\`\`\`\n`;
          }
        } 
        // If it's an object, show the top-level keys
        else {
          summary += `Object with ${keys.length} top-level keys: ${keys.join(', ')}\n\n`;
          
          // Show a sample of the data structure
          const sampleData = {};
          keys.slice(0, 5).forEach(key => {
            sampleData[key] = json[key];
          });
          
          summary += `Sample data:\n\`\`\`json\n${JSON.stringify(sampleData, null, 2)}\n`;
          if (keys.length > 5) summary += "...\n";
          summary += `\`\`\`\n`;
        }
        
        return summary;
      }
      
      return `JSON Data from ${file.name}:\n\n\`\`\`json\n${formattedJson}\n\`\`\``;
    } catch (e) {
      // If parsing fails, return the raw text
      return `JSON Data from ${file.name} (invalid JSON):\n\n${text}`;
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