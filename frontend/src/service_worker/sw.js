/// <reference lib="webworker" />
/// <reference types="vite/client" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
const manifest = self.__WB_MANIFEST;
// Pre-cache file statici
precacheAndRoute(manifest || [{ url: '/offline.html', revision: null }]);
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
// Fallback per le navigazioni: servi sempre l'app shell
registerRoute(({ request }) => request.mode === 'navigate', new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
        new ExpirationPlugin({
            maxEntries: 25,
            maxAgeSeconds: 60 * 60 * 24 // 1 giorno
        })
    ]
}));
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
self.addEventListener("fetch", (event) => {
    event.respondWith(caches.match(event.request).then(cacheRes => {
        return cacheRes || fetch(event.request); //return cache res or fetch req if the resource is not in the cache
    }));
});
async function showNotification(notificationTitle, notificationBody, notificationIcon, notificationTag) {
    self.registration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: notificationIcon,
        tag: notificationTag,
    });
}
