import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  root: '.', // Project root directory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@shadcn/ui', 'framer-motion', 'lucide-react', 'date-fns', 'react-router-dom']
        }
      }
    }
  },
  server: {
    host: true
  },
  // Add this history API fallback for development server
  // to handle client-side routing properly
  preview: {
    port: 5173,
    host: true,
    strictPort: false
  }
});