"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
const firebase_1 = require("../firebase/firebase");
const node_cron_1 = __importDefault(require("node-cron"));
class NotificationManager {
    static instance;
    constructor() { }
    static getInstance() {
        if (NotificationManager.instance == null) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }
    startCheckNotification() {
        const db = firebase_1.initializedFirestonAdmin.firestore();
        const messaging = firebase_1.initializedFirestonAdmin.messaging();
        // ogni minuto
        node_cron_1.default.schedule("*/1 * * * *", async () => {
            const now = Date.now();
            const snaps = await db
                .collection("notifications")
                .where("when", "<=", now)
                .where("sent", "==", false)
                .get();
            if (snaps.empty) {
                console.log("[Cron] Nessuna notifica da inviare");
                return;
            }
            // Prepara batch e array di Message
            const batch = db.batch();
            const messages = [];
            for (const docSnap of snaps.docs) {
                const data = docSnap.data();
                // Costruisci il singolo Message per questo token
                const msg = {
                    token: data.fcmToken,
                    notification: {
                        title: data.title,
                        body: data.body,
                        imageUrl: data.icon,
                    },
                    data: {
                        tag: data.tag,
                        notificationID: data.notificationID,
                    },
                };
                messages.push(msg);
                // marchia come "inviato" per evitare duplicati
                batch.update(docSnap.ref, { sent: true });
            }
            try {
                // Unica chiamata batch per tutti i token/payload diversi
                const batchResponse = await messaging.sendEach(messages);
                console.log(`[Cron] sendEach: success=${batchResponse.successCount}, failure=${batchResponse.failureCount}`);
            }
            catch (err) {
                console.error("[Cron] Errore in sendEach():", err);
            }
            // Commit dell’update 'sent: true'
            await batch.commit();
            console.log(`[Cron] Inviate ${snaps.size} notifiche (sendEach)`);
        });
    }
}
exports.NotificationManager = NotificationManager;
