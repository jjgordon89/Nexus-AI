import React, { useState, useEffect } from 'react';
import { FileIcon, FileTextIcon, FileSpreadsheetIcon, FileJsonIcon, Loader2Icon } from 'lucide-react';
import { Button } from './button';
import { WorkerManager } from '../../lib/worker-manager';
import { ErrorBoundary } from '../error-boundary';

interface FilePreviewProps {
  file: File;
  onClose?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);
        
        // Use the worker manager to process the file
        const extractedContent = await WorkerManager.processFile(file);
        setContent(extractedContent);
        setProgress(100);
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file content');
        setContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [file]);

  const getFileIcon = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileIcon className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'md':
      case 'rtf':
        return <FileTextIcon className="h-6 w-6 text-blue-500" />;
      case 'csv':
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheetIcon className="h-6 w-6 text-green-500" />;
      case 'json':
        return <FileJsonIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{file.name}</h3>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB • {file.type || 'Unknown type'}
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-md border border-border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <span className="text-muted-foreground">Processing file...</span>
              {progress > 0 && progress < 100 && (
                <div className="w-full max-w-xs mt-4 bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-destructive p-4 text-center">
              <p className="font-medium">Error loading file</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <pre className="text-sm whitespace-pre-wrap">{content}</pre>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};