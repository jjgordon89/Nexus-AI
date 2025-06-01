import React, { Component, ErrorInfo } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
              <AlertTriangleIcon className="h-6 w-6 text-destructive" />
            </div>
            
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCwIcon className="h-4 w-4" />
                Reload Page
              </Button>
              
              <Button
                variant="default"
                onClick={this.handleReset}
                className="gap-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}