import { defineConfig } from 'vite'

export default defineConfig({
  root: 'januprime',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
})
