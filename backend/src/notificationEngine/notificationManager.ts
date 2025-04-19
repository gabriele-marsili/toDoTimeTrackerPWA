import * as admin from "firebase-admin";
import { initializedFirestonAdmin } from "../firebase/firebase";
import cron from 'node-cron';

interface NotificationDoc {
    licenseKey: string;
    uId: string;
    title: string;
    body: string;
    tag: string;
    icon: string; //icon path
    when: number; //timestamp
    fcmToken: string;
    sent: boolean;
    notificationID: string; //the same of the related event/todo/time tracker rule
}

export class NotificationManager {
    private static instance: NotificationManager;

    private constructor() { }

    public static getInstance() {
        if (NotificationManager.instance == null) {
            NotificationManager.instance = new NotificationManager()
        }
        return NotificationManager.instance
    }

    public startCheckNotification() {
        const db = initializedFirestonAdmin.firestore();
        const messaging = initializedFirestonAdmin.messaging();

        // ogni minuto
        cron.schedule("*/1 * * * *", async () => {
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
            const messages: admin.messaging.Message[] = [];

            for (const docSnap of snaps.docs) {
                const data = docSnap.data() as NotificationDoc;

                // Costruisci il singolo Message per questo token
                const msg: admin.messaging.Message = {
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
            } catch (err) {
                console.error("[Cron] Errore in sendEach():", err);
            }

            // Commit dell’update 'sent: true'
            await batch.commit();
            console.log(`[Cron] Inviate ${snaps.size} notifiche (sendEach)`);
        });
    }

}