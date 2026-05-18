import { defineConfig } from 'vite'

export default defineConfig({
  // Si no tienes plugins de PWA todavía, déjalo así de simple para que funcione el despliegue
  server: {
    port: 5173
  }
})