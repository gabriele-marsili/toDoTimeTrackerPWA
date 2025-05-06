import { TimeTrackerHandler, TimeTrackerRuleObj } from "../engine/timeTracker";
import { userDBentry } from "../types/userTypes";

// Unione dei tipi di messaggi (solo i 'type' stringhe) che possono essere inviati dalla PWA all'estensione
export type PwaToExtMessageType =
    "UPDATE_TIME_TRACKER_RULES" |
    "REQUEST_TIME_TRACKER_RULES" |
    // Aggiungi qui altri tipi di messaggi che la PWA invia all'estensione
    "PWA_READY" // Esempio: notifica al background che la PWA è pronta

// Unione dei tipi di messaggi (solo i 'type' stringhe) che possono essere inviati dall'estensione alla PWA
export type ExtToPwaMessageType =
    "LIMIT_REACHED" |
    // Aggiungi qui altri tipi di messaggi che l'estensione invia alla PWA
    "RULES_UPDATED_FROM_EXT" // Esempio: l'estensione conferma aggiornamento o invia regole
// "EXT_INITIALIZED" // Esempio: notifica che l'estensione è pronta

type payload = { rules: TimeTrackerRuleObj }

// Interfacce per la struttura completa dei messaggi inviati/ricevuti
// Messaggi inviati dalla PWA all'estensione
interface PwaToExtMessage {
    type: PwaToExtMessageType;
    // Usa tipi specifici per payload se possibile, altrimenti any o un'unione di payload possibili
    payload?: payload | any; // payload può essere del tipo updateTTrulesInExtPayload o altro
}

// Messaggi ricevuti dall'estensione (passano dal content script ponte)
interface ExtToPwaMessage {
    type: ExtToPwaMessageType;
    // payload può essere del tipo UsageUpdatePayload, LimitReachedPayload, o altro
    payload?: payload | any;
    source: 'TTT_EXTENSION_BRIDGE'; // Aggiunto dal content script ponte
}

export class ExtComunicator {
    private static instance: ExtComunicator;
    public licenseKey: string
    private isListening = false; // Flag per assicurarsi di registrare il listener una sola volta
    private timeTrackerHandler: TimeTrackerHandler
    // Callback per gestire i messaggi ricevuti dall'estensione
    // Queste dovrebbero essere impostate dall'applicazione PWA (es. nei componenti che si iscrivono)
    private messageHandlers: { [key in ExtToPwaMessageType]?: (payload: any) => void } = {};

    private extID = ""
    private constructor(timeTrackerHandler: TimeTrackerHandler, licenseKey: string) {
        this.timeTrackerHandler = timeTrackerHandler
        this.initMessageListener();
        this.licenseKey = licenseKey;
        //default handlers for ext -to-> pwa:
        this.on("LIMIT_REACHED", (payload: { rule: TimeTrackerRuleObj }) => {
            console.log("[Ext comunicator] : limit reached event with payload : ", payload)
        })

        this.on("RULES_UPDATED_FROM_EXT", async (payload: { timeTrackerRules: TimeTrackerRuleObj[] }) => {
            for (let r of payload.timeTrackerRules) {
                const ttRule = this.timeTrackerHandler.fromRuleObj(r)
                await this.timeTrackerHandler.addOrUpdateRule(this.licenseKey, ttRule);
            }
        })

    }

    public static getInstance(timeTrackerHandler: TimeTrackerHandler, licenseKey: string) {
        if (!this.instance) {
            this.instance = new ExtComunicator(timeTrackerHandler, licenseKey)
        }
        return this.instance
    }

    // Metodo per impostare i gestori (callback) per tipi specifici di messaggi dall'estensione
    public on<T extends ExtToPwaMessageType>(messageType: T, handler: (payload: any) => void): void {
        // Semplicemente registra la callback per il tipo di messaggio
        this.messageHandlers[messageType] = handler;
        console.log(`ExtComunicator: Handler registered for message type: ${messageType}`);
    }

    // Metodo per rimuovere un gestore (opzionale)
    public off<T extends ExtToPwaMessageType>(messageType: T): void {
        delete this.messageHandlers[messageType];
        console.log(`ExtComunicator: Handler removed for message type: ${messageType}`);
    }

    public deleteAllHandlers() {
        delete this.messageHandlers["LIMIT_REACHED"]
        delete this.messageHandlers["RULES_UPDATED_FROM_EXT"]
    }


    // Inizializza il listener per i messaggi in arrivo dall'estensione (tramite window.postMessage dal content script ponte)
    private initMessageListener(): void {
        if (this.isListening) {
            console.log("ExtComunicator: Message listener already initialized.");
            return;
        }

        console.log("ExtComunicator: Initializing message listener from extension bridge.");

        // window.addEventListener('message', ...) DEVE essere registrato una sola volta per l'intera app PWA
        // Il Singleton assicura che initMessageListener() venga chiamato una sola volta con isListening flag
        window.addEventListener('message', (event) => {
            // IMPORTANTE: Controlla SEMPRE l'origine del messaggio per sicurezza!
            // E l'identificatore della fonte (source) aggiunto dal tuo content script ponte.
            // window.location.origin è l'origine della pagina corrente (la tua PWA)
            if (event.origin !== window.location.origin || !event.data || event.data.source !== 'TTT_EXTENSION_BRIDGE') {
                // console.warn("ExtComunicator: Ignoring message from untrusted origin or source.", event.origin, event.data);
                return; // Ignora messaggi da origini diverse o non dal nostro content script
            }

            // Assicurati che il messaggio abbia una struttura base attesa
            const message = event.data as ExtToPwaMessage; // Casta il messaggio al tipo atteso

            console.log("ExtComunicator: Received message from extension (via bridge):", message.type, message.payload);

            // Cerca un gestore registrato per questo tipo di messaggio
            const handler = this.messageHandlers[message.type];
            if (handler) {
                // Se c'è un gestore registrato, chiama la sua callback con il payload
                try {
                    handler(message.payload);
                } catch (handlerError) {
                    console.error(`ExtComunicator: Error executing handler for message type ${message.type}:`, handlerError);
                }
            } else {
                console.warn(`ExtComunicator: No handler registered for message type: ${message.type}`);
                // Opzionale: logga o gestisci messaggi non gestiti
            }
        });

        this.isListening = true;
        console.log("ExtComunicator: Message listener initialized.");
    }



    // Metodo per inviare un messaggio al Background Script dell'estensione
    // Usa PwaToExtMessage come tipo per il messaggio inviato
    public sendMessageToExtension(message: PwaToExtMessage): void {
        // Controlla se l'ambiente supporta le API di Chrome Extensions (solo nel browser, non in SSR, ecc.)
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            try {
                // Invia il messaggio all'estensione specificando l'ID
                chrome.runtime.sendMessage(this.extID, message, (response) => {
                    // Gestisci la risposta (opzionale e asincrona) dal background script
                    if (chrome.runtime.lastError) {
                        console.error("ExtComunicator: Error sending message to extension:", chrome.runtime.lastError.message);
                        // Gestisci l'errore nella UI della PWA se necessario
                    } else {
                        console.log("ExtComunicator: Response received from extension:", response);
                        // Gestisci la risposta di successo (es. conferma aggiornamento)
                    }
                });
            } catch (error) {
                // Cattura errori sincroni (es. estensione non installata/disabilitata, ID errato, manifest non corretto)
                console.error("ExtComunicator: Exception while sending message to extension:", error);
                // Informa l'utente che l'estensione potrebbe non essere attiva
            }
        } else {
            console.warn("ExtComunicator: Chrome Extensions API not available. Cannot send message.");
            // Utile per test in ambienti non-extension
        }
    }

    // Metodo interno per inviare un messaggio e ricevere una risposta basata su Promise
    // Utilizzato dai metodi pubblici che si aspettano una risposta (come requestTimeTrackerRules)
    private sendMessageAndGetResponse<T>(message: PwaToExtMessage): Promise<T> {
        return new Promise((resolve, reject) => {
            // Controlla se l'ambiente supporta le API di Chrome Extensions e se l'ID estensione è impostato
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage || !this.extID) {
                const errorMsg = "Chrome Extensions API not available, runtime.sendMessage missing, or Extension ID not set.";
                console.warn("ExtComunicator:", errorMsg);
                // Simula una risposta di errore per coerenza se l'API non è disponibile
                // Puoi scegliere di rejectedare la promise o risolvere con un errore specifico nel payload
                resolve({ success: false, error: errorMsg } as any); // O reject(new Error(errorMsg));
                return; // Esci dalla funzione senza chiamare sendMessage
            }

            try {
                // Invia il messaggio all'estensione specificando l'ID e fornendo la callback per la risposta
                chrome.runtime.sendMessage(this.extID, message, (response: T) => { // Il tipo T è la risposta attesa
                    // Questa callback viene eseguita quando il background script chiama sendResponse()
                    if (chrome.runtime.lastError) {
                        // Se c'è un errore gestito dall'API (es. estensione disinstallata), rejecteda la promise
                        const error = chrome.runtime.lastError;
                        console.error("ExtComunicator: Error receiving response from extension:", error.message);
                        reject(error); // Reject con l'oggetto errore API
                    } else {
                        // Se non ci sono errori API, risolvi la promise con la risposta ricevuta
                        console.log("ExtComunicator: Response received from extension:", response);
                        resolve(response); // Risolvi con la risposta
                    }
                });
            } catch (error: any) {
                // Cattura errori sincroni che possono verificarsi *durante* la chiamata a sendMessage
                console.error("ExtComunicator: Exception while calling sendMessage:", error);
                resolve(error); // Reject la promise con l'eccezione
            }
        });
    }

    // Metodi helper per inviare messaggi specifici (opzionale, rende il codice chiamante più leggibile)
    public updateTTrulesInExt(rules: TimeTrackerRuleObj[]): void {
        const message: PwaToExtMessage = {
            type: "UPDATE_TIME_TRACKER_RULES",
            payload: { rules: rules } // Incapsula i dati nel payload atteso dal background
        };
        this.sendMessageToExtension(message);
    }

    // Metodo per richiedere le regole dall'estensione e attendere la risposta
    public requestTimeTrackerRules(): Promise<TimeTrackerRuleObj[]> {
        const message: PwaToExtMessage = {
            type: "REQUEST_TIME_TRACKER_RULES",
            // Nessun payload specifico richiesto
        };
        // Usa sendMessageAndGetResponse per inviare e ottenere una Promise della risposta
        return this.sendMessageAndGetResponse<TimeTrackerRuleObj[]>(message);
    }

    public notifyPwaReady(userInfo: userDBentry): void {
        const message: PwaToExtMessage = {
            type: "PWA_READY",
            payload: userInfo
        };
        this.sendMessageToExtension(message);
    }

}
