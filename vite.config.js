import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.pps.makalabox.com/',  // ⬅️ ваш Symfony-backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});