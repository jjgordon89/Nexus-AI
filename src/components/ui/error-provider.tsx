import React, { createContext, useContext, useState } from 'react';
import { useToast } from './toast';
import { AIError } from '../../lib/ai/error';

interface ErrorContextType {
  handleError: (error: unknown) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType>({
  handleError: () => {},
  clearError: () => {},
});

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: unknown) => {
    let message = 'An unexpected error occurred';
    
    if (error instanceof AIError) {
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    setError(error instanceof Error ? error : new Error(message));
    
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext);