import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@libsql/client'],
    esbuildOptions: {
      target: 'es2022'
    }
  },
  define: {
    'process.env': {}
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    target: 'es2022'
  },
  base: '/',
});