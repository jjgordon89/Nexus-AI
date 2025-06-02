/**
 * Worker Manager
 * 
 * This module provides a centralized way to create and manage web workers
 * for offloading heavy processing tasks from the main thread.
 */

import { getFileExtension } from './utils';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export class WorkerManager {
  private static workers: Map<string, Worker> = new Map();
  
  /**
   * Creates or returns an existing worker
   */
  static getWorker(type: string): Worker {
    if (this.workers.has(type)) {
      return this.workers.get(type)!;
    }
    
    // Create a new worker
    const worker = new Worker(
      new URL('../workers/document-processor.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    this.workers.set(type, worker);
    return worker;
  }

  /**
   * Process a file using a web worker
   */
  static async processFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const extension = getFileExtension(file.name).toLowerCase();
      let type = '';
      
      // Determine file type
      if (['txt', 'md', 'text', 'markdown'].includes(extension)) {
        type = 'text';
      } else if (extension === 'pdf') {
        type = 'pdf';
      } else if (['doc', 'docx'].includes(extension)) {
        type = 'docx';
      } else if (extension === 'csv') {
        type = 'csv';
      } else if (extension === 'json') {
        type = 'json';
      } else {
        return reject(new Error(`Unsupported file type: .${extension}`));
      }
      
      // Get the worker for this file type
      const worker = this.getWorker(type);
      
      // Convert file to ArrayBuffer
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        
        // Set up the message handler
        const messageHandler = (e: MessageEvent) => {
          const { type: messageType, result, error } = e.data;
          
          if (messageType === 'complete') {
            worker.removeEventListener('message', messageHandler);
            resolve(result);
          } else if (messageType === 'error') {
            worker.removeEventListener('message', messageHandler);
            reject(new Error(error));
          } else if (messageType === 'needPDFJS') {
            // Worker needs PDF.js - we need to provide it
            worker.postMessage({
              type: 'pdfJSReady',
              pdfjs: pdfjs
            });
          } else if (messageType === 'needMammoth') {
            // Worker needs mammoth.js
            worker.postMessage({
              type: 'mammothReady',
              mammoth: mammoth
            });
          }
          // Progress updates could be handled here too
        };
        
        // Listen for messages from the worker
        worker.addEventListener('message', messageHandler);
        
        // Send the file to the worker
        worker.postMessage({
          file,
          type,
          buffer
        });
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Terminate all workers
   */
  static terminateAll() {
    this.workers.forEach(worker => {
      worker.terminate();
    });
    this.workers.clear();
  }
}