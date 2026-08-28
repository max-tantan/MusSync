import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lastfm': {
        target: 'https://ws.audioscrobbler.com/2.0/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lastfm/, ''),
      },
    },
  },
})