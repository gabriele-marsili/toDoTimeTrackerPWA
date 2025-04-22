importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyD0iZyzMT-SZC1KPmJxIQjBXg5kjWOKhME",
    authDomain: "ttt-webapp-unipi.firebaseapp.com",
    projectId: "ttt-webapp-unipi",
    storageBucket: "ttt-webapp-unipi.firebasestorage.app",
    messagingSenderId: "395315852092",
    appId: "1:395315852092:web:e4dbb16746b56816f7e439",
    measurementId: "G-F7V5FT5TC8"
};

firebase.initializeApp(firebaseConfig);

// ---- notifications : 

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message', payload);

    // Estrai i dati dal payload. Preferiamo payload.data per i dati custom.
    // payload.notification contiene titolo e corpo che possono essere mostrati
    // direttamente dal browser in alcuni casi, ma usiamo payload.data per
    // garantire coerenza e accesso nel click handler.
    const notificationTitle = payload.data.title || payload.notification?.title || 'Nuova Notifica';
    const notificationBody = payload.data.body || payload.notification?.body || 'Contenuto notifica';
    const notificationIcon = payload.data.icon || payload.notification?.icon || self.registration.scope + 'path/to/default/icon.png'; // Assicurati un'icona di default
    const notificationTag = payload.data.tag || 'default_tag'; // Usiamo il tag dal data payload
    const notificationId = payload.data.notificationID; // ID notifica dal data payload
    const customData = payload.data; // Passiamo tutto il payload.data per il click handler


    // Costruisci le opzioni per la notifica nativa del browser
    const options = {
        body: notificationBody,
        icon: notificationIcon,
        // 'tag' per raggruppare le notifiche (ad esempio, per non mostrare più notifiche per lo stesso ID)
        // Usiamo notificationId come tag per raggruppare notifiche con lo stesso ID
        tag: notificationId || notificationTag, // Usa notificationId se disponibile, altrimenti il tag generico
        renotify: true, // Riproduci audio/vibrazione anche se una notifica con lo stesso tag è già visibile
        requireInteraction: true, // La notifica rimane visibile finché non viene cliccata o chiusa dall'utente
        // Passa i dati custom qui. Saranno disponibili nell'evento notificationclick
        data: customData
    };

    // Mostra la notifica
    // self.registration.showNotification ritorna una Promise
    self.registration.showNotification(notificationTitle, options)
        .catch(error => {
            console.error('[firebase-messaging-sw.js] Error showing notification:', error);
        });
});

// ---- Gestione Click su Notifica ----

// Gestisce il click sulla notifica nativa mostrata dal Service Worker
self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click received:', event);

    // Chiudi la notifica non appena viene cliccata
    event.notification.close();

    // Recupera i dati custom passati con la notifica
    const clickedNotificationData = event.notification.data;
    console.log('[firebase-messaging-sw.js] Data from clicked notification:', clickedNotificationData);

    // Determina l'URL di destinazione dal tag o da altri dati
    const targetUrl = clickedNotificationData?.tag; // Usiamo il 'tag' passato nel data payload come URL

    if (targetUrl) {
        let url = String(targetUrl)
        if(url.includes("event")){
            url = "home"
        }
        // Previene l'azione di default del browser
        event.waitUntil(
            clients.matchAll({
                type: 'window', // Cerca solo client di tipo 'window' (schede del browser)
                includeUncontrolled: true // Includi anche i client che questo SW non controlla ancora direttamente
            })
            .then(windowClients => {
                let matchingClient = null;

                // Cerca una scheda PWA già aperta
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    // Puoi aggiungere controlli più specifici qui, ad es. sull'origine
                    // if (client.url.startsWith(self.registration.scope) && client.focused) { ... }
                    if (client.url.startsWith(self.registration.scope)) { // Cerca qualsiasi client PWA
                         matchingClient = client;
                         break;
                    }
                }

                if (matchingClient) {
                    console.log('[firebase-messaging-sw.js] Existing client found, focusing and navigating:', targetUrl);
                    // Se un client PWA esiste, mettilo a fuoco e naviga
                    // navigate() restituisce una Promise per la navigazione
                    return matchingClient.focus().then(() => matchingClient.navigate(targetUrl));
                } else {
                     console.log('[firebase-messaging-sw.js] No existing client found, opening new window:', targetUrl);
                    // Altrimenti, apri una nuova scheda con l'URL di destinazione
                    return clients.openWindow(url);
                }
            })
            .catch(error => {
                 console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
            })
        );
    } else {
        console.warn('[firebase-messaging-sw.js] Notification click: No target URL found in data payload.');
         // Potresti voler aprire la home page della PWA come fallback
         // event.waitUntil(clients.openWindow(self.registration.scope));
    }
});

// Nota: L'handler onMessage per i messaggi in primo piano va implementato nell'app principale (non nel service worker)
// Esempio (nel tuo codice JavaScript principale dell'app):
/*
import { getMessaging, onMessage } from "firebase/messaging";
const messaging = getMessaging(app);
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Mostra una notifica in-app all'utente (es. un banner, un toast)
  // NON usare self.registration.showNotification qui, è per il service worker
});
*/