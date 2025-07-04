import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from 'path'
import mkcert from 'vite-plugin-mkcert' // Importa il plugin


export default defineConfig({
  base:"./",
  plugins: [
    vue(),
    tailwindcss(),
    mkcert(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/service_worker',
      filename: "sw.ts",
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST'
      },
      
      manifest: {
        name: "TTT",
        short_name: "TTT",
        description: "A toDo list and time tracker PWA",
        theme_color: "#ffffff",
        icons: [
          { src: "img/mainLogo_192_192.png", sizes: "192x192", type: "image/png" },
          { src: "img/mainLogo_512_512.png", sizes: "512x512", type: "image/png" },
        ],
        start_url: "/",
        display: "standalone"
      },
                  
      devOptions: {
        enabled: true,
        type: "module"
      }
    }),
  ],
  server: {
    https: {}
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        offline: resolve(__dirname, 'offline.html')
      }
    }
  }
})
