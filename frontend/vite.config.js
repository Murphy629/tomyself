import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Manually load env from project root
  const env = loadEnv(mode, path.resolve(__dirname, '..'))

  const PORT = Number(env.VITE_FRONTEND_PORT || 5173)
  const BACKEND_PORT = Number(env.VITE_BACKEND_PORT || 3000)

  return {
    plugins: [vue()],
    server: {
      port: PORT,
      host: '0.0.0.0',
      proxy: {
        '/backend': {
          target: `http://backend:${BACKEND_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/backend/, '')
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  }
})