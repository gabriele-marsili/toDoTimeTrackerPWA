import { API_gestor } from "../backend-comunication/api_comunication.js";
import { baseResponse } from "../types/utilityTypes.js";
import { TTT_Notification } from "./notification.js";

export type CalendarObj = {
    id: string
    eventDate: Date;
    title: string;
    description: string;
    category: string;
    durationInH: number;
    notices: TTT_Notification[] //avvisi prima dell'evento
};

export class CalendarEvent {
    public eventDate: Date;
    public title: string;
    public description: string;
    public category: string;
    public durationInH: number;
    public id: string;
    public notices: TTT_Notification[] //avvisi prima dell'evento

    constructor(
        id: string,
        eventDate: Date,
        title: string,
        description: string,
        category: string = '',
        durationInH: number = 1
    ) {
        this.notices = []
        this.id = id;
        this.eventDate = eventDate;
        this.title = title;
        this.description = description;
        this.category = category;
        this.durationInH = durationInH;
    }

    public getAsObj(): CalendarObj {
        return {
            id: this.id,
            eventDate: this.eventDate,
            title: this.title,
            description: this.description,
            category: this.category,
            durationInH: this.durationInH,
            notices: this.notices
        };
    }

}

export class CalendarEventHandler {
    private static instance: CalendarEventHandler;
    private apiGestor: API_gestor;
    private events: Map<string, CalendarEvent> = new Map();
    private fcmToken: string;

    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
        this.fcmToken = ""
    }

    public static getInstance(apiGestor: API_gestor): CalendarEventHandler {
        if (!CalendarEventHandler.instance) {
            CalendarEventHandler.instance = new CalendarEventHandler(apiGestor);
        }
        return CalendarEventHandler.instance;
    }

    private async checkFcmToken() {
        if (this.fcmToken == "") {
            const tk = await this.apiGestor.registerFCMToken()
            if (tk == "") throw new Error("FCM Token not setted")
            if (tk.includes("error")) throw new Error(tk)

            this.fcmToken = tk
        }
        return this.fcmToken
    }

    /**
     * 
     * @returns a new id for a calendar event (actual timestamp)
     */
    public getNextCalendarEventId(): string {
        return new Date().getTime().toString()
    }

    public async addOrUpdateEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse> {
        try {
            const response = await this.apiGestor.addOrUpdateCalendarEvent(licenseKey, event);
            if (!response.success) throw new Error(response.errorMessage);

            this.events.set(event.id, event);

            //add / update notification :
            console.log("event date : ", event.eventDate)
            console.log("event notices :\n", event.notices)
            const tk = await this.checkFcmToken();
            const eventNotification: TTT_Notification = {
                notificationID: event.id + "_notification",
                body: "Don't forger the event " + event.title,
                scheduleAt_timestamp: event.eventDate,
                imagePath: "../assets/mainLogo.png",
                tag: "event notification",
                title: event.title,
                fcmToken: tk
            }

            //schedule event notices 
            for (let notice of event.notices) {
                notice.fcmToken = tk; //update fcm tk
                let r = await this.apiGestor.scheduleNotification(notice, licenseKey)
                console.log(`notice ${notice.notificationID} r:`,r);
            }

            return await this.apiGestor.scheduleNotification(eventNotification, licenseKey)

        } catch (err: any) {
            console.error("Error adding/updating calendar event:", err);
            return { success: false, errorMessage: err.message };
        }
    }

    public async removeEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse> {
        try {
            const eventId = event.id
            if (!this.events.has(eventId)) throw new Error(`Event with id ${eventId} does not exist.`);

            const response = await this.apiGestor.removeCalendarEvent(licenseKey, eventId);
            if (!response.success) throw new Error(response.errorMessage);

            this.events.delete(eventId);

            //delete notification:
            let deleteR = await this.apiGestor.deleteNotification(eventId + "_notification", licenseKey)
            console.log("deleteR (event notification):\n", deleteR)

            //de-schedule (delete) event notices 
            event.notices.forEach(async (notice) => await this.apiGestor.deleteNotification(notice.notificationID, licenseKey))

            return { success: true, errorMessage: "" };
        } catch (err: any) {
            console.error("Error removing calendar event:", err);
            return { success: false, errorMessage: err.message };
        }
    }

    public getEvent(id: string): CalendarEvent | undefined {
        return this.events.get(id);
    }

    public getAllEvents(): CalendarEvent[] {
        return Array.from(this.events.values());
    }

    public async loadAllEvents(licenseKey: string): Promise<{
        success: boolean,
        errorMessage: string,
        events: CalendarObj[]
    }> {
        try {
            const response = await this.apiGestor.getCalendarEvents(licenseKey);
            if (!response.success) throw new Error(response.errorMessage);

            this.events.clear();
            for (const obj of response.eventObjects) {
                const e = this.fromCalendarObj(obj);
                this.events.set(e.id, e);
            }
            return { success: true, errorMessage: "", events: response.eventObjects };
        } catch (err: any) {
            console.error("Error loading all calendar events:", err);
            return { success: false, errorMessage: err.message, events: [] };
        }
    }

    public fromCalendarObj(obj: CalendarObj & { id: string }): CalendarEvent {
        const event = new CalendarEvent(
            obj.id,
            obj.eventDate,
            obj.title,
            obj.description,
            obj.category,
            obj.durationInH
        );
        this.events.set(event.id, event);
        return event
    }
}
