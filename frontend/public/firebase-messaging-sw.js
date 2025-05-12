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
    const notificationTitle = payload.data.title || payload.notification?.title || 'New Notification';
    const notificationBody = payload.data.body || payload.notification?.body || '';
    const notificationIcon = payload.notification?.image || self.registration.scope + '../mainLogo.png'; 
    const notificationTag = payload.data.tag || 'default_tag';
    const notificationId = payload.data.notificationID;
    const customData = payload.data;
 
    const options = {
        body: notificationBody,
        icon: notificationIcon,
        tag: notificationId || notificationTag,
        renotify: true, 
        requireInteraction: true,        
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
        if(url.includes("event")||url.includes("to do")){
            url = "home"
        }
        if(url.toLowerCase().includes("friend request")||url.toLowerCase().includes("gift")){
            url = "profile_page"
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

// Aggiungi questo listener AL TUO ESISTENTE FILE firebase-messaging-sw.js
// Non cancellare il codice esistente (quello per onBackgroundMessage e notificationclick)

self.addEventListener('message', function(event) {
    console.log('[firebase-messaging-sw.js] Messaggio ricevuto dalla finestra:', event.data);

    // IMPORTANTE: Controlla l'origine e il tipo del messaggio per sicurezza
    // event.origin contiene l'origine della finestra che ha inviato il messaggio
    // event.data contiene i dati inviati
    if (event.data && event.data.type === 'SHOW_CUSTOM_NOTIFICATION' && event.data.payload) {
        console.log('[firebase-messaging-sw.js] Ricevuta richiesta per mostrare notifica custom.');

        const notificationData = event.data.payload;

        // Prepara le opzioni per showNotification basate sul payload ricevuto
        const title = notificationData.title || 'Time Limit Reached!';
        const options = {
            body: notificationData.body || '',
            icon: notificationData.icon || self.registration.scope + '../mainLogo.png', // Usa icona ricevuta o fallback
            tag: notificationData.tag || 'custom_pwa_notification', // Usa tag ricevuto o fallback
            renotify: notificationData.renotify || true,
            requireInteraction: notificationData.requireInteraction || true,
            data: notificationData.data // Allega i dati custom ricevuti. Saranno disponibili nell'handler 'notificationclick'.
            // Puoi aggiungere qui altre opzioni standard come 'actions', 'vibrate', 'sound' se li passi nel payload
        };

        // Mostra la notifica usando l'API standard del Service Worker
        // self.registration è disponibile all'interno del Service Worker
        event.waitUntil(
            self.registration.showNotification(title, options)
                .catch(error => {
                    console.error('[firebase-messaging-sw.js] Errore mostrando notifica custom:', error);
                })
        );

        // Non devi chiamare event.source.postMessage qui a meno che tu non voglia
        // inviare un feedback esplicito alla finestra che ha richiesto la notifica.

    }
    // Ignora altri tipi di messaggi che il Service Worker non deve gestire
});

