/// <reference lib="webworker" />
/// <reference types="vite/client" />
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

import { cleanupOutdatedCaches, getCacheKeyForURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { SW_BROADCAST_CHANNEL } from '../utils/generalUtils.js';
import { API_gestor } from '../backend-comunication/api_comunication.js';
import { ExtComunicator } from '../comunicator/extComunicator.js';
import { TimeTrackerHandler, TimeTrackerRuleObj } from '../engine/timeTracker.js';


declare const self: ServiceWorkerGlobalScope;

//messages via broadcast channel:

const apiGestor: API_gestor = API_gestor.getInstance();
const timeTrackerHandler = TimeTrackerHandler.getInstance(apiGestor)
let rules: TimeTrackerRuleObj[] = []
let licenseKeyGlobal : string = ""
const manifest = self.__WB_MANIFEST;
console.log("manifest :\n", manifest)
// Pre-cache file statici
precacheAndRoute(manifest);
/*precacheAndRoute([
    { url: '/offline.html', revision: null },
    { url: '/main_offline.js', revision: null },
    { url: '/style_offline.css', revision: null },
]);*/

let allowlist: undefined | RegExp[]
if (import.meta.env.DEV) {
    allowlist = [/^\/$/]
}
console.log("allow list = ", allowlist)

// clean old assets
cleanupOutdatedCaches()

// Gestione delle richieste a Firestore - modalità offline-first con sync
registerRoute(
    /^https:\/\/firestore\.googleapis\.com/,
    new NetworkFirst({
        cacheName: 'firebase-data',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 settimana
            })
        ]
    })
)

// Gestione della cache per le immagini
registerRoute(
    /\.(png|jpg|jpeg|svg|gif)$/,
    new CacheFirst({
        cacheName: 'images-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
            })
        ]
    })
)

// Caching per le icone di Google Fonts (stili CSS)
registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    new CacheFirst({
        cacheName: 'google-fonts-stylesheets',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
            })
        ]
    })
);

// Caching per i file dei font (le icone) di Google Fonts
registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 giorni
            })
        ]
    })
);


// Caching for JS/CSS assets (adjust the regex based on your file structure)
registerRoute(
    /.*\.(js|css|vue|webmanifest)/,
    new CacheFirst({
        cacheName: 'static-assets',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            }),
        ],
    })
);

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
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 25,
                maxAgeSeconds: 60 * 60 * 24 // 1 giorno
            })
        ]
    })
);

//(global) handler workbox errors:
setCatchHandler(async ({ request }) => {
    console.log("req in set cactch handler:\n", request)
    const acceptHeader = request.headers.get("accept") || "";
    console.log("acceptHeader = ", acceptHeader)

    //HTML :
    if (acceptHeader.includes("text/html") && !request.url.includes(".js") && !request.url.includes(".css")) {
        let k = getCacheKeyForURL("offline.html") || "k not found"
        console.log("cache k = ", k)
        if (k == "k not found") {
            k = "offline"
        }
        const fallbackResponse = await caches.match(k);
        console.log("fallback (html) response (k)", fallbackResponse)

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
        console.log("fallback (js) response:\n", fallbackResponse)
        if (fallbackResponse) {
            return fallbackResponse;
        }
    }

    //css :    
    if (request.url.includes(".css")) {
        const fallbackResponse = await caches.match('/style.css');
        console.log("fallback (css) response:\n", fallbackResponse)
        if (fallbackResponse) {
            return fallbackResponse;
        }
    }

    // Per altri tipi di risorsa, restituisci una response "benigna" in base al destination
    console.log("request.destination = ", request.destination)
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

async function updateRules(licenseKey: string) {
    const response = await timeTrackerHandler.loadAllRules(licenseKey)
    if (response.success) {
        rules = response.rules.map(r => timeTrackerHandler.fromRuleObj((r)));
    }
}

async function checkLicenseKey(licenseKey: string): Promise<string> {
    if (licenseKey != "") {
        return licenseKey
    } else {
        const r = await apiGestor.getUserInfo(true)
        return r.userInfo_DB?.licenseKey || ""
    }
}

self.addEventListener("install", async (event) => {
    console.log("SW installazione completata!");
    self.skipWaiting();

    const res = await apiGestor.getUserInfo(true)
    if (res.userInfo_DB) {
        const userInfo = res.userInfo_DB
        licenseKeyGlobal = userInfo.licenseKey
        const extComunicator: ExtComunicator = ExtComunicator.getInstance(timeTrackerHandler, licenseKeyGlobal);


        //ottengo rules da ext + controllo (ed eventuale update db + update locale)
        const extRuls = await extComunicator.requestTimeTrackerRules()
    
        if (Array.isArray(extRuls)) {
            let mergedRules = await timeTrackerHandler.mergeAndCheckCoerence(rules, extRuls,licenseKeyGlobal)
            rules = []
            for (let r of mergedRules) {
                rules.push(timeTrackerHandler.fromRuleObj(r));
            }
        }

        extComunicator.on("ASK_RULES_FROM_EXT", async () => {
            licenseKeyGlobal = await checkLicenseKey(licenseKeyGlobal)
            if (licenseKeyGlobal != "") {
                extComunicator.licenseKey = licenseKeyGlobal
            }
            await updateRules(licenseKeyGlobal)
            extComunicator.updateTTrulesInExt(rules)
        })


        extComunicator.on("RULES_UPDATED_FROM_EXT", async (payload: { timeTrackerRules: TimeTrackerRuleObj[] }) => {
            //check + merge per coerenza
            if (Array.isArray(payload.timeTrackerRules)) {
                licenseKeyGlobal = await checkLicenseKey(licenseKeyGlobal)
                if (licenseKeyGlobal != "") {
                    extComunicator.licenseKey = licenseKeyGlobal
                }
                await updateRules(licenseKeyGlobal)
                let mergedRules = await timeTrackerHandler.mergeAndCheckCoerence(rules, payload.timeTrackerRules, licenseKeyGlobal)
                rules = []
                for (let r of mergedRules) {
                    rules.push(timeTrackerHandler.fromRuleObj(r));
                }
            }
        })
    }


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
