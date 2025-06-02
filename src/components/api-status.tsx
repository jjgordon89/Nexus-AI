/**
 * API Status component
 * 
 * This component displays the status of the API server connection.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface ApiStatusProps {
  className?: string;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      } catch (error) {
        console.error('API health check failed:', error);
        setStatus('offline');
      }
    };

    checkApiStatus();
    
    // Check periodically
    const interval = setInterval(checkApiStatus, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span>API:</span>
      {status === 'checking' && (
        <div className="flex items-center text-muted-foreground">
          <ActivityIcon className="h-4 w-4 mr-1 animate-pulse" />
          <span>Checking</span>
        </div>
      )}
      
      {status === 'online' && (
        <div className="flex items-center text-success">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          <span>Online</span>
        </div>
      )}
      
      {status === 'offline' && (
        <div className="flex items-center text-destructive">
          <XCircleIcon className="h-4 w-4 mr-1" />
          <span>Offline</span>
        </div>
      )}
    </div>
  );
};