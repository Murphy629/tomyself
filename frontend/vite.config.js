import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load ALL env vars from project root (incl. non-VITE_ keys)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')

  const num = (v, d) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : d
  }

  const FRONTEND_PORT = num(env.FRONTEND_PORT ?? env.VITE_FRONTEND_PORT, 5173)
  const BACKEND_PORT  = num(env.BACKEND_PORT  ?? env.VITE_BACKEND_PORT, 3000)

  const GRAFANA_HOST = env.GRAFANA_HOST || '127.0.0.1'
  const GRAFANA_PORT = num(env.GRAFANA_PORT, 5000)

  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: FRONTEND_PORT,
      proxy: {
        // Backend API (legacy path, prefer /api; dev only, use Nginx in prod)
        '/backend': {
          target: `http://localhost:${BACKEND_PORT}`,
          changeOrigin: true,
          secure: false,
          rewrite: p => p.replace(/^\/backend/, ''),
        },

        // Grafana UI & API (dev only; use Nginx in prod)
        // If you want the SPA to use /grafana, set in Grafana:
        //   server.serve_from_sub_path = true
        //   server.root_url = %(protocol)s://%(domain)s:%(http_port)s/grafana/
        '/grafana': {
          target: `http://${GRAFANA_HOST}:${GRAFANA_PORT}`,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: p => p.replace(/^\/grafana/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})