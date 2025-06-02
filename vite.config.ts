import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && 
      visualizer({ 
        open: true, 
        filename: 'stats.html', 
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react', 'docx', '@libsql/client'],
    esbuildOptions: {
      target: 'es2022'
    }
  },
  define: {
    'process.env': {}
  },
  build: {
    target: 'es2022',
    sourcemap: mode === 'analyze',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and core libraries
          'vendor-react': ['react', 'react-dom'],
          
          // Split UI components
          'vendor-ui': ['framer-motion', 'next-themes', 'react-markdown', 'sonner'],
          
          // Split by AI provider
          'ai-openai': ['openai'],
          'ai-anthropic': ['@anthropic-ai/sdk'],
          'ai-google': ['@google/generative-ai'],
          'ai-mistral': ['@mistralai/mistralai'],
          'ai-groq': ['groq-sdk'],
          'ai-huggingface': ['@huggingface/inference'],
          
          // Split document processing libraries
          'document-processors': ['pdfjs-dist', 'mammoth', 'docx'],
          
          // Split virtualization
          'virtualization': ['react-window'],
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    // Set up CSP in development too
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: '/',
}));