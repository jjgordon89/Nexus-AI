import { ThemeProvider } from 'next-themes';
import { Toaster } from './ui/toast';
import { LoadingProvider } from './ui/loading-provider';
import { ErrorProvider } from './ui/error-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorProvider>
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}