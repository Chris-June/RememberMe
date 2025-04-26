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