import React, { useState } from 'react';
import { File, FileTextIcon, XIcon, EyeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { FilePreview } from '../ui/file-preview';
import { formatFileSize } from '../../lib/utils';

interface FileAttachmentProps {
  file: File;
  onRemove: () => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onRemove }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-md border border-border bg-background p-2 pr-10">
        <div className="p-1.5 rounded-md bg-muted">
          <FileTextIcon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 absolute right-10 hover:bg-muted"
          onClick={togglePreview}
          title="Preview file"
        >
          <EyeIcon className="h-3.5 w-3.5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 absolute right-1 hover:bg-muted"
          onClick={onRemove}
          title="Remove file"
        >
          <XIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      {showPreview && (
        <div className="mt-2">
          <FilePreview file={file} onClose={() => setShowPreview(false)} />
        </div>
      )}
    </div>
  );
};