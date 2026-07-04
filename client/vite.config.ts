import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    // Prevent Vite from auto-discovering/reading any other PostCSS config files
    // (notably JSON configs that may include a UTF-8 BOM).
    postcss: './postcss.config.js',
  },
  server: {
    port: 5173,
  },
})




