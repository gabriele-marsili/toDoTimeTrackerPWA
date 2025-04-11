/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, getCacheKeyForURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { SW_BROADCAST_CHANNEL } from '../utils/generalUtils.js';
//messages via broadcast channel:
const broadcast = new BroadcastChannel(SW_BROADCAST_CHANNEL);
const manifest = self.__WB_MANIFEST;
console.log("manifest :\n", manifest);
// Pre-cache file statici
precacheAndRoute(manifest);
/*precacheAndRoute([
    { url: '/offline.html', revision: null },
    { url: '/main_offline.js', revision: null },
    { url: '/style_offline.css', revision: null },
]);*/
let allowlist;
if (import.meta.env.DEV) {
    allowlist = [/^\/$/];
}
console.log("allow list = ", allowlist);
// clean old assets
cleanupOutdatedCaches();
// Gestione delle richieste a Firestore - modalità offline-first con sync
registerRoute(/^https:\/\/firestore\.googleapis\.com/, new NetworkFirst({
    cacheName: 'firebase-data',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 1 settimana
        })
    ]
}));
// Gestione della cache per le immagini
registerRoute(/\.(png|jpg|jpeg|svg|gif)$/, new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
        })
    ]
}));
// Caching per le icone di Google Fonts (stili CSS)
registerRoute(/^https:\/\/fonts\.googleapis\.com/, new CacheFirst({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
        })
    ]
}));
// Caching per i file dei font (le icone) di Google Fonts
registerRoute(/^https:\/\/fonts\.gstatic\.com/, new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
        })
    ]
}));
// Caching for JS/CSS assets (adjust the regex based on your file structure)
registerRoute(/.*\.(js|css|vue|webmanifest)/, new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
        }),
    ],
}));
// Gestione di altre API esterne
/*registerRoute(
    /^https:\/\/api\.tuodominio\.com/,
    new NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 giorno
            })
        ]
    })
)*/
//router navigazioni + fallback
registerRoute(({ request }) => request.mode === 'navigate', new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 25,
            maxAgeSeconds: 60 * 60 * 24 // 1 giorno
        })
    ]
}));
//(global) handler workbox errors:
setCatchHandler(async ({ request }) => {
    console.log("req in set cactch handler:\n", request);
    const acceptHeader = request.headers.get("accept") || "";
    console.log("acceptHeader = ", acceptHeader);
    //HTML :
    if (acceptHeader.includes("text/html") && !request.url.includes(".js") && !request.url.includes(".css")) {
        let k = getCacheKeyForURL("offline.html") || "k not found";
        console.log("cache k = ", k);
        if (k == "k not found") {
            k = "offline";
        }
        const fallbackResponse = await caches.match(k);
        console.log("fallback (html) response (k)", fallbackResponse);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        return new Response("<h1>You're currently offline</h1>", {
            headers: { "Content-Type": "text/html" }
        });
    }
    //js :
    if (request.url.includes(".js")) {
        const fallbackResponse = await caches.match('/main_offline.js');
        console.log("fallback (js) response:\n", fallbackResponse);
        if (fallbackResponse) {
            return fallbackResponse;
        }
    }
    //css :    
    if (request.url.includes(".css")) {
        const fallbackResponse = await caches.match('/style.css');
        console.log("fallback (css) response:\n", fallbackResponse);
        if (fallbackResponse) {
            return fallbackResponse;
        }
    }
    // Per altri tipi di risorsa, restituisci una response "benigna" in base al destination
    console.log("request.destination = ", request.destination);
    /*switch (request.destination) {
      case "script":
        return new Response("", { headers: { "Content-Type": "application/javascript" } });
      case "style":
        return new Response("", { headers: { "Content-Type": "text/css" } });
      case "image":
        // Potresti restituire anche un placeholder in formato base64 se ne hai uno
        return new Response("", { headers: { "Content-Type": "image/png" } });
      default:
        // Per le richieste che non rientrano nei casi sopra, restituisci una response vuota
        return new Response("", { headers: { "Content-Type": "text/plain" } });
    }*/
    return Response.error();
});
self.addEventListener("install", (event) => {
    console.log("SW installazione completata!");
    self.skipWaiting();
});
self.addEventListener("activate", (event) => {
    console.log("Service Worker is active!");
    event.waitUntil(self.clients.claim());
    self.clients.matchAll().then((clients) => {
        console.log(`📢 Service Worker controlla ${clients.length} client(s) attivi`);
        clients.forEach(client => console.log("Client URL:", client.url));
    });
});
self.addEventListener('notificationclick', (event) => {
    event.waitUntil(self.clients.openWindow(event.notification.tag));
    event.notification.close();
});
/*
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(async (cacheRes) => {
            if (cacheRes) {
                return cacheRes
            } else {

                return fetch(event.request).catch(async () => {

                    console.log("resource NOT found in cache, relative request:\n", event.request)
                    //return fetch(event.request); //return cache res or fetch req if the resource is not in the cache
                    let pages = [
                        "/welcome",
                        "/login",
                        "/register"
                    ]

                    let included = pages.some(p => event.request.url.toLowerCase().includes(p))
                    console.log("url : ", event.request.url)
                    console.log("included : ", included)
                    if (included || event.request.mode === "navigate") {
                        const fallbackResponse = await caches.match('/offline.html');
                        console.log("fallbackResponse: ", fallbackResponse)
                        if (fallbackResponse) {
                            return fallbackResponse;
                        } else {
                            console.log("posting broadcast msg...")
                            broadcast.postMessage({ type: "offline", content: "load offline-redirect page" });
                        }
                    }

                    return fetch(event.request)
                })
            }

        })
    )

})
*/
async function showNotification(notificationTitle, notificationBody, notificationIcon, notificationTag) {
    self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: notificationIcon,
        tag: notificationTag,
    });
}
