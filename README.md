# ToDo List and TimeTracker PWA

Una Progressive Web App per gestire le tue attività, tracciare il tempo e aumentare la produttività.


## Utilizzo

Questa sezione descrive i passaggi necessari per avviare sia il backend che il frontend dell'applicazione.
Nota : attualmente la PWA è utilizzabile unicamente in locale.

### Prerequisiti

Assicurati di aver installato [Node.js](https://nodejs.org/) e [npm](https://www.npmjs.com/) sul tuo sistema. 
Anche [TypeScript](https://www.typescriptlang.org/) è richiesto per la compilazione.

### Backend

Segui questi passaggi per configurare e avviare il server backend:

1.  Naviga nella directory del backend:
    ```bash
    cd backend
    ```
2.  Installa le dipendenze del progetto:
    ```bash
    npm install    
    ```
3.  Compila il codice TypeScript:
    ```bash
    tsc
    ```
4.  Avvia il server backend:
    ```bash
    npm run start   
    ```
    Il backend dovrebbe ora essere in esecuzione e pronto ad accettare connessioni in localhost.

### Frontend (PWA)

Segui questi passaggi per configurare, compilare e avviare il frontend dell'applicazione:

1.  Naviga nella directory del frontend:
    ```bash
    cd frontend
    ```
2.  Installa le dipendenze del progetto:
    ```bash
    npm install    
    ```
3.  Compila il codice TypeScript:
    ```bash
    tsc
    ```
    Questo passaggio compila i file TypeScript in JavaScript (anche se Vite lo fa automaticamente in `dev` e `build`, eseguire `tsc` separatamente può aiutare a individuare errori di tipo).
4.  **Esegui una build di produzione** (obbligatorio per generare i file finali della PWA):
    ```bash
    npm run build    
    ```
    Questo comando compila e ottimizza il codice frontend per la produzione, creando i file nella directory `dist/`. La build è necessaria affinché la PWA e il Service Worker funzionino correttamente.
5.  **Avvia l'applicazione:**
    * **Ambiente di Sviluppo (consigliato):**
        ```bash
        npm run dev       
        ```
        Questo avvia un server di sviluppo con hot-reloading. Accedi all'applicazione tramite l'URL fornito.
    * **Anteprima di Produzione (per testare la build locale):**
        ```bash
        npm run preview       
        ```
        Questo serve la build ottimizzata dalla directory `dist/`.
        Può essere utile per evitare limitazioni nei test delle funzionalità in cui è richiesto che la PWA sia offline.

### Primo Avvio e Accesso

Una volta che sia il backend che il frontend sono in esecuzione e accessibili tramite browser:

1.  Naviga alla pagina di **Registrazione**.
2.  Completa il modulo di registrazione.
3.  Dopo una registrazione riuscita, riceverai la tua **License Key** via email. Questa chiave è essenziale per accedere.
4.  Vai alla pagina di **Login**.
5.  Utilizza la License Key ricevuta via email per accedere all'applicazione.

## Tecnologie Utilizzate

Il progetto è sviluppato utilizzando le seguenti tecnologie:

* **Frontend:**
    * Vue 3 (prevalentemente con Composition API e `<script setup>`)
    * TypeScript
    * Vite 
    * Tailwind CSS 
    * Vue Router (per la navigazione)
    * Workbox (integrato tramite `vite-plugin-pwa` per il Service Worker)
* **Backend:**
    * Node.js (presumibilmente un framework come Express o simile)
    * TypeScript
    * Firebase Admin SDK (per interagire con Firebase da backend)
    * libsodium-wrappers (per crittografia/DH, come visto in `api_comunication.ts`)
* **Database & Servizi Cloud:**
    * Firebase Authentication (per la gestione utenti tramite License Key/Email)
    * Firestore (come database NoSQL per dati utenti)
    * Firebase Cloud Messaging (FCM) (per le notifiche push)

## Prerequisiti

Assicurati di avere installati i seguenti software:

* [Node.js](https://nodejs.org/) (versione 14 o superiore raccomandata)
* [npm](https://www.npmjs.com/) o [Yarn](https://yarnpkg.com/) (gestore di pacchetti)
* [TypeScript](https://www.typescriptlang.org/) (installato globalmente o localmente con `npm install typescript -g`)

