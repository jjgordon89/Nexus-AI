import React from 'react';
import { FileIcon, ExternalLinkIcon, DownloadIcon } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { Button } from '../ui/button';

interface DocumentPreviewProps {
  document: {
    id: string;
    name: string;
    type: string;
    size: number;
    url?: string;
  };
  onClose?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const isPreviewable = document.type.startsWith('image/') || 
                       document.type === 'application/pdf' ||
                       document.type === 'text/plain' ||
                       document.type === 'text/markdown' ||
                       document.type === 'application/json' ||
                       document.type === 'text/csv';

  return (
    <div className="mx-4 my-2 p-4 rounded-lg border border-border bg-card">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-muted">
          <FileIcon className="h-8 w-8 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{document.name}</h4>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(document.size)} • {document.type.split('/')[1].toUpperCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isPreviewable && document.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 mr-1" />
                Preview
              </a>
            </Button>
          )}
          
          {document.url && (
            <Button variant="outline" size="sm" asChild>
              <a href={document.url} download={document.name}>
                <DownloadIcon className="h-4 w-4 mr-1" />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
      
      {isPreviewable && document.url && document.type.startsWith('image/') && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <img
            src={document.url}
            alt={document.name}
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>
      )}
    </div>
  );
};