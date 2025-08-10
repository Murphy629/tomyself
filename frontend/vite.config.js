import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const PORT = Number(process.env.FRONTEND_PORT || 5173)
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 3000)

export default defineConfig({
  plugins: [vue()],
  server: {
    port: PORT,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: `http://backend:${BACKEND_PORT}`,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})