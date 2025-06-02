import { ThemeProvider } from 'next-themes';
import { Toaster } from './ui/toast';
import { LoadingProvider } from './ui/loading-provider';
import { ErrorProvider } from './ui/error-provider';
import { AuthProvider } from '../lib/auth/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ErrorProvider>
        <LoadingProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LoadingProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
}