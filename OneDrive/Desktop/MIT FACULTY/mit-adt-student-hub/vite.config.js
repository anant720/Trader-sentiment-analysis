import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Allow importing CSV as raw text
  assetsInclude: ['**/*.csv'],
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
