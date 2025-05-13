import { TimeTrackerHandler, TimeTrackerRuleObj } from "../engine/timeTracker";
import { userDBentry } from "../types/userTypes";

export type PwaToExtMessageType =
    "UPDATE_TIME_TRACKER_RULES" |
    "REQUEST_TIME_TRACKER_RULES" |
    "PWA_READY"

export type ExtToPwaMessageType = "LIMIT_REACHED" | "TTT_EXTENSION_ID_BROADCAST" | "RULES_UPDATED_FROM_EXT" | "ASK_RULES_FROM_EXT"


type payload = { rules: TimeTrackerRuleObj }

// Interfacce per la struttura completa dei messaggi inviati/ricevuti
interface PwaToExtMessage {
    type: PwaToExtMessageType;
    payload?: payload | any; // payload può essere del tipo updateTTrulesInExtPayload o altro
    source: 'TTT_PWA_CLIENT' // Identifica la fonte
    requestId?: string
}

// Messaggi ricevuti dall'estensione (passano dal content script ponte)
interface ExtToPwaMessage {
    type: ExtToPwaMessageType;
    payload?: payload | any;
    source: 'TTT_EXTENSION_BRIDGE'; // Aggiunto dal content script ponte
    requestId?: string
    error?: string
}

interface CustomWindow extends Window {
    __TTT_EXTENSION_ID__?: string;
}


export class ExtComunicator {
    private static instance: ExtComunicator;
    public licenseKey: string
    private isListening = false; // Flag per assicurarsi di registrare il listener una sola volta
    private timeTrackerHandler: TimeTrackerHandler
    private messageHandlers: { [key in ExtToPwaMessageType]?: (payload: any) => void } = {};

    // Mappa per tenere traccia delle richieste Promise in sospeso
    private pendingRequests: Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void, timeoutId: any }> = new Map();
    private requestIdCounter = 0; // Contatore per generare ID richieste unici

    private extID = ""
    private constructor(timeTrackerHandler: TimeTrackerHandler, licenseKey: string) {
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
        this.on("LIMIT_REACHED", async (payload: { rule: TimeTrackerRuleObj }) => {
            console.log("[Ext comunicator] : limit reached event with payload : ", payload)
            const rule = payload.rule
            const notificationData = {
                title: `It's enought ${rule.site_or_app_name} for today!`,
                body: `Time limit of ${rule.minutesDailyLimit}m reached for site ${rule.site_or_app_name}`,

            }
            await this.showClientSideNotification(notificationData)
        })

        this.on("ASK_RULES_FROM_EXT", async () => {
            const loadRes = await this.timeTrackerHandler.loadAllRules(this.licenseKey)
            console.log("load res ASK_RULES_FROM_EXT : \n",loadRes)
            if (loadRes.success) {
                this.updateTTrulesInExt(loadRes.rules)
            }
        })

        this.on("RULES_UPDATED_FROM_EXT", async (payload: { timeTrackerRules: TimeTrackerRuleObj[] }) => {
            const loadRes = await this.timeTrackerHandler.loadAllRules(this.licenseKey)            
            if (Array.isArray(payload.timeTrackerRules) && loadRes.success) {
                await timeTrackerHandler.mergeAndCheckCoerence(loadRes.rules, payload.timeTrackerRules, this.licenseKey)               
            }
        })

    }

    public static getInstance(timeTrackerHandler: TimeTrackerHandler, licenseKey: string) {
        if (!this.instance) {
            this.instance = new ExtComunicator(timeTrackerHandler, licenseKey)
        }
        return this.instance
    }

    private async showClientSideNotification(notificationData: {
        title: string;
        body: string;
    }) {
        const permissionGranted = await this.ensureNotificationPermission();
        if (!permissionGranted) {
            console.warn("Impossibile mostrare la notifica: permesso non concesso.");
            return;
        }

        if (!navigator.serviceWorker) {
            console.warn("Questo browser non supporta i Service Worker.");
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            if (registration.active) {
                console.log("SW pronto. Invio messaggio al SW per mostrare notifica...");
                registration.active.postMessage({
                    type: 'SHOW_CUSTOM_NOTIFICATION',
                    payload: notificationData
                });
                console.log("Messaggio 'SHOW_CUSTOM_NOTIFICATION' inviato al SW.");

            } else {
                console.warn("Service Worker non attivo.");
            }

        } catch (error) {
            console.error("Errore durante la comunicazione con il Service Worker:", error);
        }
    }

    private async ensureNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn("Questo browser non supporta le notifiche desktop.");
            return false;
        }

        if (Notification.permission === 'granted') {
            console.log("Permesso notifiche già concesso.");
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn("Permesso notifiche negato dall'utente.");
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log("Permesso notifiche concesso dopo la richiesta.");
                return true;
            } else {
                console.warn("Permesso notifiche negato dall'utente durante la richiesta.");
                return false;
            }
        } catch (error) {
            console.error("Errore durante la richiesta permesso notifiche:", error);
            return false;
        }
    }

    // Metodo per impostare i gestori (callback) per tipi specifici di messaggi dall'estensione
    public on<T extends ExtToPwaMessageType>(messageType: T, handler: (payload: any) => void): void {
        // Semplicemente registra la callback per il tipo di messaggio
        this.messageHandlers[messageType] = handler;
        console.log(`ExtComunicator: Handler registered for message type: ${messageType}`);
    }

    // Metodo per rimuovere un gestore
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

        // Il Singleton assicura che initMessageListener() venga chiamato una sola volta con isListening flag
        window.addEventListener('message', (event) => {

            if (event.origin !== window.location.origin || !event.data || event.data.source !== 'TTT_EXTENSION_BRIDGE') {
                console.warn("ExtComunicator: Ignoring message from untrusted origin or source.", event.origin, event.data);
                return
            }
            
            const message = event.data as ExtToPwaMessage; 

            // --- Gestione delle risposte alle richieste PWA -> Ext ---            
            if (message.requestId && this.pendingRequests.has(message.requestId)) {
                const { resolve, reject, timeoutId } = this.pendingRequests.get(message.requestId)!;

                clearTimeout(timeoutId);
                this.pendingRequests.delete(message.requestId);

                if (message.error) {
                    console.error("ExtComunicator: Promise rejected for request ID", message.requestId, "with error:", message.error);
                    reject(new Error(`Extension Error for ${message.type}: ${message.error}`)); // Reject con un errore
                } else {
                    console.log("ExtComunicator: Promise resolved for request ID", message.requestId);
                    console.log("message.payload:\n", message.payload)
                    resolve(message.payload);
                }
                return;
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
            }
        });

        this.isListening = true;
        console.log("ExtComunicator: Message listener initialized.");
    }



    // Metodo per inviare un messaggio al Background Script dell'estensione
    public sendMessageToExtension(message: PwaToExtMessage): void {
        try {
            window.postMessage(message, window.location.origin);
        } catch (error) {
            console.log("[ExtComunicator] error in send message to ext:\n", error)
            console.log("[ExtComunicator] message that caused error:\n", message)
        }
    }

    // Metodo per inviare un messaggio AL CONTENT SCRIPT e attendere la risposta dall'Estensione
    private sendMessageAndGetResponse<T>(message: Omit<PwaToExtMessage, 'source' | 'requestId'>): Promise<T> {
        return new Promise((resolve, reject) => {
            // Genera un ID univoco per questa specifica richiesta
            this.requestIdCounter++;
            const requestId = `req-${Date.now()}-${this.requestIdCounter}`; 

            console.log("ExtComunicator: Sending message to bridge for forwarding and awaiting response:", message.type, "(Request ID:", requestId, ")");

            const messageToSend: PwaToExtMessage = {
                ...message,
                source: 'TTT_PWA_CLIENT',
                requestId: requestId 
            };

            // Memorizza resolve e reject per questa richiesta in sospeso
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                console.error("ExtComunicator: Response timeout for request ID", requestId, message.type);
                reject(new Error(`Response timeout for message type: ${message.type}`));
            }, 10000); // Timeout dopo 10 secondi 

            this.pendingRequests.set(requestId, { resolve, reject, timeoutId });

            // Invia il messaggio al content script via postMessage
            window.postMessage(messageToSend, window.location.origin);
        });
    }

    // Metodi helper per inviare messaggi specifici 
    public updateTTrulesInExt(rules: TimeTrackerRuleObj[]): void {
        const message: PwaToExtMessage = {
            type: "UPDATE_TIME_TRACKER_RULES",
            source: "TTT_PWA_CLIENT",
            payload: { rules: rules } 
        };
        this.sendMessageToExtension(message);
    }

    // Metodo per richiedere le regole dall'estensione e attendere la risposta
    public requestTimeTrackerRules(): Promise<TimeTrackerRuleObj[]> {
        const message: PwaToExtMessage = {
            type: "REQUEST_TIME_TRACKER_RULES",
            source: "TTT_PWA_CLIENT"
        };        
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
