import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env so process.env works correctly in this config file
  const env = loadEnv(mode, process.cwd(), '');

  const apiUrl = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],

    css: {
      postcss: './postcss.config.cjs',
    },

    server: {
      port: 5173,
      // Dev proxy: forwards /api/* to the backend so CORS never fires in dev
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Raise the chunk-size warning threshold slightly — 3rd-party libs are large
      chunkSizeWarningLimit: 800,
    },
  };
});
