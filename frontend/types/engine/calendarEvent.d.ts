import { API_gestor } from "../backend-comunication/api_comunication.js";
import { baseResponse } from "../types/utilityTypes.js";
import { TTT_Notification } from "./notification.js";
export type CalendarObj = {
    id: string;
    eventDate: Date;
    title: string;
    description: string;
    category: string;
    durationInH: number;
    notices: TTT_Notification[];
};
export declare class CalendarEvent {
    eventDate: Date;
    title: string;
    description: string;
    category: string;
    durationInH: number;
    id: string;
    notices: TTT_Notification[];
    constructor(id: string, eventDate: Date, title: string, description: string, category?: string, durationInH?: number);
    getAsObj(): CalendarObj;
}
export declare class CalendarEventHandler {
    private static instance;
    private apiGestor;
    private events;
    private fcmToken;
    private constructor();
    static getInstance(apiGestor: API_gestor): CalendarEventHandler;
    private checkFcmToken;
    /**
     *
     * @returns a new id for a calendar event (actual timestamp)
     */
    getNextCalendarEventId(): string;
    addOrUpdateEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse>;
    removeEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse>;
    getEvent(id: string): CalendarEvent | undefined;
    getAllEvents(): CalendarEvent[];
    loadAllEvents(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        events: CalendarObj[];
    }>;
    fromCalendarObj(obj: CalendarObj & {
        id: string;
    }): CalendarEvent;
}
