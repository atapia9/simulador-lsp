import { defineConfig } from 'vite';

// GitHub Pages publica el sitio en /simulador-lsp/, por eso la ruta base.
export default defineConfig({
  base: '/simulador-lsp/',
  build: {
    // Three.js pesa ~700 KB minificado; es esperado y no es un problema.
    chunkSizeWarningLimit: 1200,
  },
});
