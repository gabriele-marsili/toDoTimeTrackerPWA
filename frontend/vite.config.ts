import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "TTT",
        short_name: "TTT",
        description: "A toDo list and time tracker PWA",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/src/mainLogo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/src/mainLogo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore.googleapis.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "firebase-cache",
            },
          },
        ],
      },
      devOptions:{enabled:true}
    }),
  ],
})
