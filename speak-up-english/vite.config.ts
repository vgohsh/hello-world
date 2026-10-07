import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repo-name>/. Override with BASE_PATH if needed.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/hello-world/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
