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
        console.log("\nstart checking notifications...");
        const db = firebase_1.initializedFirestonAdmin.firestore();
        const messaging = firebase_1.initializedFirestonAdmin.messaging();
        // ogni minuto
        node_cron_1.default.schedule("*/1 * * * *", async () => {
            try {
                const now = Date.now();
                console.log("\n[Cron] Checking notifications at ", new Date(now), " | ", now);
                //snap su notifiche non mandate 
                const snaps = await db
                    .collection("notifications")
                    .get();
                const dueNotifications = [];
                for (let doc of snaps.docs) {
                    const data = doc.data();
                    console.log("data:\n", data);
                    const userNotifications = data.notifications;
                    const filteredNotifications = userNotifications.filter((n) => {
                        return n.when.toMillis() <= now && !n.sent;
                    });
                    //console.log("filtered notifications:\n",filteredNotifications)
                    for (const notification of filteredNotifications) {
                        dueNotifications.push({
                            notification: notification,
                            originalDocRef: doc.ref,
                            originalNotificationsArray: userNotifications // Salva l'array originale completo
                        });
                        //check and end karma booost effect : 
                        if (notification.tag.includes("KarmaBoostEnd")) {
                            let parts = notification.tag.split(":");
                            console.log("parts in karma boost end notification tag\n", parts);
                            let boost = Number(parts[1]);
                            console.log("boost : ", boost);
                            let username = parts[3];
                            const user_q = db.collection("users").where("username", "==", username);
                            const snapshot = await user_q.get();
                            if (!snapshot.empty) {
                                try {
                                    const userDocRef = snapshot.docs[0].ref;
                                    const userDocData = snapshot.docs[0].data();
                                    if (userDocData.karmaBoost == boost) {
                                        await userDocRef.update({ karmaBoost: 0 });
                                    }
                                }
                                catch (error) {
                                    console.log("error updating db for karma boost:\n", error);
                                }
                            }
                            else {
                                console.log("snapshot empty for username " + username);
                            }
                        }
                    }
                }
                console.log(`\n[Cron] Found ${dueNotifications.length} due notifications.`);
                if (dueNotifications.length === 0) {
                    console.log("[Cron] No notifications to send");
                    return;
                }
                // Prepara l'array di Message per FCM
                const messagesToSend = dueNotifications.map(item => ({
                    token: item.notification.fcmToken,
                    notification: {
                        title: item.notification.title,
                        body: item.notification.body,
                        imageUrl: item.notification.icon,
                    },
                    data: {
                        tag: item.notification.tag,
                        notificationID: item.notification.notificationID,
                        uId: item.notification.uId,
                        licenseKey: item.notification.licenseKey,
                    },
                }));
                console.log(`[Cron] Attempting to send ${messagesToSend.length} messages via FCM.`);
                let batchResponse;
                try {
                    // Invia le notifiche FCM
                    batchResponse = await messaging.sendEach(messagesToSend);
                    console.log(`[Cron] sendEach completed. Success: ${batchResponse.successCount}, Failure: ${batchResponse.failureCount}`);
                    batchResponse.responses.forEach((res, index) => {
                        if (!res.success) {
                            console.log(`[Cron] FCM Send Error for message ${index}:`, res.error);
                        }
                        else {
                            console.log(`[Cron] FCM Send Success for message ${index}: messageId = ${res.messageId}`);
                        }
                    });
                }
                catch (err) {
                    console.log("[Cron] Error during messaging.sendEach():", err);
                    // Decidi se vuoi comunque tentare un batch parziale o abortire
                    return; // Abortiamo l'update del batch se l'invio fallisce a questo livello
                }
                // --- PREPARA IL BATCH DI UPDATE PER FIRESTORE ---
                const updateBatch = db.batch();
                // Usiamo una Map per raggruppare le notifiche da aggiornare per ogni documento
                const notificationsToMarkAsSent = new Map(); // Key: docRef.path, Value: Set<notificationID>
                // Itera sulle risposte di sendEach per identificare quali notfiche sono state inviate con successo
                batchResponse.responses.forEach((response, index) => {
                    if (response.success) {
                        const originalInfo = dueNotifications[index]; // Ottieni le info originali della notifica inviata
                        const docPath = originalInfo.originalDocRef.path;
                        const notificationId = originalInfo.notification.notificationID;
                        //raggruppo notifiche per docPath nella map
                        if (!notificationsToMarkAsSent.has(docPath)) {
                            notificationsToMarkAsSent.set(docPath, new Set());
                        }
                        notificationsToMarkAsSent.get(docPath).add(notificationId);
                    }
                });
                console.log(`[Cron] Preparing batch update for ${notificationsToMarkAsSent.size} documents.`);
                // Ora scorri i documenti originali (o usa i riferimenti salvati) per preparare gli update
                // È più efficiente iterare direttamente sui riferimenti unici che hanno avuto notifiche inviate con successo
                for (const [docPath, sentNotificationIds] of notificationsToMarkAsSent.entries()) {
                    // Recupera il riferimento al documento (potremmo averlo salvato prima, ma riottenerlo dalla path è sicuro)
                    const docRef = db.doc(docPath);
                    // Dobbiamo leggere di nuovo il documento QUI per ottenere lo stato più recente dell'array 'notifications'.
                    // Alternativa: salvare l'array originale ALL'INIZIO e modificarne una copia.
                    // L'approccio di salvare l'array originale all'inizio è generalmente più efficiente perché evita una read per ogni documento.
                    // Riusiamo l'array salvato in dueNotifications
                    const originalDocInfo = dueNotifications.find(item => item.originalDocRef.path === docPath);
                    if (originalDocInfo) {
                        // Crea una COPIA dell'array originale per modificarlo in memoria
                        const updatedNotificationsArray = originalDocInfo.originalNotificationsArray.map(n => {
                            // Se questa notifica è tra quelle inviate con successo per questo documento, aggiorna 'sent'
                            if (sentNotificationIds.has(n.notificationID)) {
                                return { ...n, sent: true }; // Crea un nuovo oggetto per non mutare l'originale se necessario
                            }
                            return n; // Restituisci la notifica invariata altrimenti
                        });
                        // Aggiungi l'operazione di update al batch per questo documento
                        updateBatch.update(docRef, { notifications: updatedNotificationsArray });
                        console.log(`[Cron] Added update for document ${docPath} to batch.`);
                    }
                    else {
                        console.warn(`[Cron] Could not find original document info for path ${docPath}. Skipping batch update for this document.`);
                    }
                }
                // Esegui il commit del batch
                if (notificationsToMarkAsSent.size > 0) {
                    console.log("[Cron] Committing batch update...");
                    const commitRes = await updateBatch.commit();
                    console.log("[Cron] Batch commit successful:", commitRes);
                }
                else {
                    console.log("[Cron] No documents needed batch updates.");
                }
            }
            catch (error) {
                console.log(`[Cron] Error in cron:\n`, error);
            }
        });
    }
    // Nuovo cron job per la pulizia delle notifiche inviate
    // Ogni 8 ore
    startCleanupNotifications() {
        console.log("\nstart scheduling notification cleanup...");
        const db = firebase_1.initializedFirestonAdmin.firestore();
        node_cron_1.default.schedule("0 */8 * * *", async () => {
            try {
                const now = Date.now();
                console.log("\n[Cron - Cleanup] Starting notification cleanup at ", new Date(now), " | ", now);
                // Ottieni tutti i documenti nella collezione 'notifications'
                const snaps = await db
                    .collection("notifications")
                    .get();
                const cleanupBatch = db.batch();
                let documentsToUpdateCount = 0;
                for (let doc of snaps.docs) {
                    const data = doc.data();
                    const userNotifications = data.notifications || [];
                    //filtra notifiche non ancora inviate (da mantenere)
                    const notificationsToKeep = userNotifications.filter(n => !n.sent);
                    // Controlla se ci sono state notifiche rimosse
                    if (notificationsToKeep.length < userNotifications.length) {
                        // Aggiungi l'operazione di update al batch
                        // Aggiorna il documento con l'array filtrato (solo le notifiche da mantenere)
                        cleanupBatch.update(doc.ref, { notifications: notificationsToKeep });
                        documentsToUpdateCount++;
                        console.log(`[Cron - Cleanup] Document ${doc.id} requires cleanup. Keeping ${notificationsToKeep.length}/${userNotifications.length} notifications.`);
                    }
                }
                console.log(`[Cron - Cleanup] Preparing batch update for ${documentsToUpdateCount} documents.`);
                // Esegui il commit del batch solo se ci sono documenti da aggiornare
                if (documentsToUpdateCount > 0) {
                    console.log("[Cron - Cleanup] Committing cleanup batch update...");
                    await cleanupBatch.commit();
                    console.log("[Cron - Cleanup] Cleanup batch committed : ");
                }
                else {
                    console.log("[Cron - Cleanup] No documents needed cleanup.");
                }
            }
            catch (error) {
                console.log(`[Cron - Cleanup] Error in cleanup cron:\n`, error);
            }
        });
    }
}
exports.NotificationManager = NotificationManager;
