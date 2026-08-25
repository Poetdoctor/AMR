import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      // Two entries: the site, and the Decap CMS admin at /admin. The admin is
      // its own page, not a route in the SPA — see src/App.tsx.
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        admin: path.resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
})
