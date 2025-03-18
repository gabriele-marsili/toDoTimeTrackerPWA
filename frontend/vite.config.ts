import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',     
      srcDir: 'src/service_worker', 
      filename : "sw.ts",
      injectManifest: {
        injectionPoint: 'self.__WB_MANIFEST'
      },
      //filename: "sw.ts",
      //injectRegister: "auto",      
      //registerType: "autoUpdate",
      manifest: {
        name: "TTT",
        short_name: "TTT",
        description: "A toDo list and time tracker PWA",
        theme_color: "#ffffff",
        icons: [
          { src: "mainLogo.png", sizes: "192x192", type: "image/png" },
          { src: "mainLogo.png", sizes: "512x512", type: "image/png" },
        ],
        start_url :"/",
        display:"standalone"
      },
      /*workbox: {
        globPatterns: ['**SLASH*.{js,css,html,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore.googleapis.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "firebase-cache",
              expiration : {
                maxEntries : 100,
                maxAgeSeconds : 60 * 60 * 24 * 7 // 1 week
              }
            },
          },
        ],
      },*/
      //srcDir : 'src/service_worker',
      devOptions: { 
        enabled: true, 
        type:"module"
      }      
    }),
  ],
})
