import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8090', changeOrigin: true },
      '/_':   { target: 'http://127.0.0.1:8090', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
