import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allows Vite to serve the Mapbox web worker file safely
      allow: ['..'] 
    }
  }
})
