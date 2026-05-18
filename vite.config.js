import { defineConfig } from 'vite'
   import react from '@vitejs/js-plugin-react' // o el framework que uses
   import { VitePWA } from 'vite-plugin-pwa'

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({ 
         registerType: 'autoUpdate',
         manifest: {
           name: 'Mi Aplicación Web',
           short_name: 'MiApp',
           description: 'Mi increíble aplicación web',
           theme_color: '#ffffff',
           icons: [
             {
               src: 'pwa-192x192.png', // Tienes que poner estos iconos en tu carpeta public
               sizes: '192x192',
               type: 'image/png'
             },
             {
               src: 'pwa-512x512.png',
               sizes: '512x512',
               type: 'image/png'
             }
           ]
         }
       })
     ]
   })