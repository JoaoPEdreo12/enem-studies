import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '6f38c7e9-7bb5-4991-befd-c5c84d4d76c1-00-2bkeb96y8duff.worf.replit.dev',
      '.replit.dev',
      '.repl.co'
    ],
    hmr: {
      clientPort: 443
    }
  }
})
