import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from /opsflow/, not the domain root.
  base: '/opsflow/',
  plugins: [react()],
})
