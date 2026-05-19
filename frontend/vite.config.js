import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Resmi Tailwind v4 eklentisi

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Motoru buraya bağladık
  ],
  build: {
    chunkSizeWarningLimit: 600
  }
})