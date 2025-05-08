import { TimeTrackerHandler, TimeTrackerRuleObj } from "../engine/timeTracker";
import { userDBentry } from "../types/userTypes";

// Unione dei tipi di messaggi (solo i 'type' stringhe) che possono essere inviati dalla PWA all'estensione
export type PwaToExtMessageType =
    "UPDATE_TIME_TRACKER_RULES" |
    "REQUEST_TIME_TRACKER_RULES" |
    // Aggiungi qui altri tipi di messaggi che la PWA invia all'estensione
    "PWA_READY" // Esempio: notifica al background che la PWA è pronta

// Unione dei tipi di messaggi (solo i 'type' stringhe) che possono essere inviati dall'estensione alla PWA
export type ExtToPwaMessageType = "LIMIT_REACHED" | "TTT_EXTENSION_ID_BROADCAST" | "RULES_UPDATED_FROM_EXT" | "ASK_RULES_FROM_EXT"


type payload = { rules: TimeTrackerRuleObj }

// Interfacce per la struttura completa dei messaggi inviati/ricevuti
// Messaggi inviati dalla PWA all'estensione
interface PwaToExtMessage {
    type: PwaToExtMessageType;
    // Usa tipi specifici per payload se possibile, altrimenti any o un'unione di payload possibili
    payload?: payload | any; // payload può essere del tipo updateTTrulesInExtPayload o altro
    source: 'TTT_PWA_CLIENT' // Identifica la fonte
    requestId?: string
}

// Messaggi ricevuti dall'estensione (passano dal content script ponte)
interface ExtToPwaMessage {
    type: ExtToPwaMessageType;
    // payload può essere del tipo UsageUpdatePayload, LimitReachedPayload, o altro
    payload?: payload | any;
    source: 'TTT_EXTENSION_BRIDGE'; // Aggiunto dal content script ponte
    requestId?: string
    error?: string
}

// Definisci l'interfaccia per la variabile globale
interface CustomWindow extends Window {
    __TTT_EXTENSION_ID__?: string;
}


export class ExtComunicator {
    private static instance: ExtComunicator;
    public licenseKey: string
    private isListening = false; // Flag per assicurarsi di registrare il listener una sola volta
    private timeTrackerHandler: TimeTrackerHandler
    // Callback per gestire i messaggi ricevuti dall'estensione
    // Queste dovrebbero essere impostate dall'applicazione PWA (es. nei componenti che si iscrivono)
    private messageHandlers: { [key in ExtToPwaMessageType]?: (payload: any) => void } = {};

    // Mappa per tenere traccia delle richieste Promise in sospeso
    private pendingRequests: Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void, timeoutId: any }> = new Map();
    private requestIdCounter = 0; // Contatore per generare ID richieste unici

    private extID = ""
    private constructor(timeTrackerHandler: TimeTrackerHandler, licenseKey: string) {
        // Cast window per accedere alla proprietà personalizzata
        const customWindow = window as CustomWindow;
        this.extID = customWindow.__TTT_EXTENSION_ID__ || "";
        this.timeTrackerHandler = timeTrackerHandler
        this.initMessageListener();
        this.licenseKey = licenseKey;

        this.on("TTT_EXTENSION_ID_BROADCAST", (ext_id) => {
            console.log("ext id in TTT_EXTENSION_ID_BROADCAST", ext_id)
            if (ext_id && typeof ext_id == "string") {
                this.extID = ext_id
                console.log("updated ext id by broadcast:\n", this.extID)
            }
        })

        //default handlers for ext -to-> pwa:
        this.on("LIMIT_REACHED", (payload: { rule: TimeTrackerRuleObj }) => {
            console.log("[Ext comunicator] : limit reached event with payload : ", payload)
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

            // E l'identificatore della fonte (source) aggiunto dal tuo content script ponte.
            // window.location.origin è l'origine della pagina corrente (la tua PWA)
            if (event.origin !== window.location.origin || !event.data || event.data.source !== 'TTT_EXTENSION_BRIDGE') {
                console.warn("ExtComunicator: Ignoring message from untrusted origin or source.", event.origin, event.data);
                return; // Ignora messaggi da origini diverse o non dal nostro content script
            }

            // Assicurati che il messaggio abbia una struttura base attesa
            const message = event.data as ExtToPwaMessage; // Casta il messaggio al tipo atteso

            // --- Gestione delle risposte alle richieste PWA -> Ext ---            
            if (message.requestId && this.pendingRequests.has(message.requestId)) {
                const { resolve, reject, timeoutId } = this.pendingRequests.get(message.requestId)!;

                // Pulisci il timeout associato a questa richiesta
                clearTimeout(timeoutId);
                this.pendingRequests.delete(message.requestId);

                // Risolvi o rejecta la Promise in base alla risposta ricevuta dal background (tramite il ponte)
                if (message.error) {
                    console.error("ExtComunicator: Promise rejected for request ID", message.requestId, "with error:", message.error);
                    reject(new Error(`Extension Error for ${message.type}: ${message.error}`)); // Reject con un errore
                } else {
                    console.log("ExtComunicator: Promise resolved for request ID", message.requestId);
                    resolve(message.payload); // Risolvi con il payload della risposta dal background
                }
                return; // Gestita la risposta
            }


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
        try {
            window.postMessage(message, window.location.origin);
        } catch (error) {
            console.log("[ExtComunicator] error in send message to ext:\n", error)
        }
    }

    // Metodo per inviare un messaggio AL CONTENT SCRIPT e attendere la risposta dall'Estensione (tramite ponte)
    private sendMessageAndGetResponse<T>(message: Omit<PwaToExtMessage, 'source' | 'requestId'>): Promise<T> {
        return new Promise((resolve, reject) => {
            // Genera un ID univoco per questa specifica richiesta
            this.requestIdCounter++;
            const requestId = `req-${Date.now()}-${this.requestIdCounter}`; // Semplice ID unico

            console.log("ExtComunicator: Sending message to bridge for forwarding and awaiting response:", message.type, "(Request ID:", requestId, ")");

            // Prepara il messaggio da inviare al content script
            const messageToSend: PwaToExtMessage = {
                ...message,
                source: 'TTT_PWA_CLIENT',
                requestId: requestId // Includi l'ID della richiesta
            };

            // Memorizza resolve e reject per questa richiesta in sospeso
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                console.error("ExtComunicator: Response timeout for request ID", requestId, message.type);
                reject(new Error(`Response timeout for message type: ${message.type}`));
            }, 10000); // Timeout dopo 10 secondi (adjust as needed)

            this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

            // Invia il messaggio al content script via postMessage
            window.postMessage(messageToSend, window.location.origin);
        });
    }

    // Metodi helper per inviare messaggi specifici (opzionale, rende il codice chiamante più leggibile)
    public updateTTrulesInExt(rules: TimeTrackerRuleObj[]): void {
        const message: PwaToExtMessage = {
            type: "UPDATE_TIME_TRACKER_RULES",
            source: "TTT_PWA_CLIENT",
            payload: { rules: rules } // Incapsula i dati nel payload atteso dal background
        };
        this.sendMessageToExtension(message);
    }

    // Metodo per richiedere le regole dall'estensione e attendere la risposta
    public requestTimeTrackerRules(): Promise<TimeTrackerRuleObj[]> {
        const message: PwaToExtMessage = {
            type: "REQUEST_TIME_TRACKER_RULES",
            source: "TTT_PWA_CLIENT"
        };
        // Usa sendMessageAndGetResponse per inviare e ottenere una Promise della risposta
        return this.sendMessageAndGetResponse<TimeTrackerRuleObj[]>(message);
    }

    public notifyPwaReady(userInfo: userDBentry): void {
        const message: PwaToExtMessage = {
            type: "PWA_READY",
            payload: userInfo,
            source: "TTT_PWA_CLIENT"
        };
        this.sendMessageToExtension(message);
    }

}
