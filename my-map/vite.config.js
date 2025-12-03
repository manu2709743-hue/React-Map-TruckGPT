import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/openrouteservice': {
        target: 'https://api.openrouteservice.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openrouteservice/, ''),
      },
      '/api/routemappers': {
        target: 'http://krowd.khichad.com/o/c/routemappers/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/routemappers/, ''),
        followRedirects: true,
      },
      '/api/backend': {
        target: 'http://krowd.khichad.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ''),
        followRedirects: true,
      },
    },
  },
})
