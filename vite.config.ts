import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Load .env file from the project root directory
  envDir: './',
  // Explicitly allow all VITE_ prefixed environment variables
  envPrefix: 'VITE_',
})
