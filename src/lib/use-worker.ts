import { useState, useEffect, useRef, useCallback } from 'react';

interface WorkerOptions {
  onMessage?: (data: any) => void;
  onError?: (error: ErrorEvent) => void;
  workerUrl: string;
}

/**
 * Custom hook for using Web Workers with React
 * 
 * This hook manages the lifecycle of a Web Worker and provides
 * a clean interface for posting messages and handling responses.
 * 
 * @param options - Configuration options for the worker
 * @returns An object with the worker instance and a function to post messages
 */
export function useWorker(options: WorkerOptions) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  // Create the worker
  useEffect(() => {
    // Only create worker in browser environment
    if (typeof Worker !== 'undefined') {
      try {
        const worker = new Worker(options.workerUrl, { type: 'module' });
        
        // Set up event handlers
        worker.onmessage = (event) => {
          if (options.onMessage) {
            options.onMessage(event.data);
          }
          setIsLoading(false);
        };
        
        worker.onerror = (event) => {
          const workerError = new Error(`Worker error: ${event.message}`);
          setError(workerError);
          setIsLoading(false);
          
          if (options.onError) {
            options.onError(event);
          }
        };
        
        workerRef.current = worker;
        
        // Clean up when component unmounts
        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to create worker'));
      }
    } else {
      setError(new Error('Web Workers are not supported in this environment'));
    }
  }, [options.workerUrl]);

  // Function to post messages to the worker
  const postMessage = useCallback((message: any, transfer?: Transferable[]) => {
    if (workerRef.current) {
      setIsLoading(true);
      setError(null);
      
      try {
        if (transfer && transfer.length > 0) {
          workerRef.current.postMessage(message, transfer);
        } else {
          workerRef.current.postMessage(message);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to post message to worker'));
        setIsLoading(false);
      }
    } else {
      setError(new Error('Worker is not initialized'));
      setIsLoading(false);
    }
  }, []);

  return {
    worker: workerRef.current,
    postMessage,
    error,
    isLoading,
  };
}