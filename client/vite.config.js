import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    // Prevent Vite from auto-discovering/reading any other PostCSS config files.
    // Resolve relative to this config file (client/), not the repo root.
    postcss: new URL('./postcss.config.js', import.meta.url).pathname,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

