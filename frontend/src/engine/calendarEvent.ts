import { API_gestor } from "../backend-comunication/api_comunication.js";
import { baseResponse } from "../types/utilityTypes.js";

export type CalendarObj = {
    id : string
    eventDate: Date;
    title: string;
    description: string;
    category: string;
    durationInH: number;
};

export class CalendarEvent {
    public eventDate: Date;
    public title: string;
    public description: string;
    public category: string;
    public durationInH: number;
    public id:string;

    constructor(
        id:string,
        eventDate: Date,
        title: string,
        description: string,
        category: string = '',
        durationInH: number = 1
    ) {
        this.id = id;
        this.eventDate = eventDate;
        this.title = title;
        this.description = description;
        this.category = category;
        this.durationInH = durationInH;
    }

    public getAsObj(): CalendarObj {
        return {
            id : this.id,
            eventDate: this.eventDate,
            title: this.title,
            description: this.description,
            category: this.category,
            durationInH: this.durationInH,
        };
    }
}

export class CalendarEventHandler {
    private static instance: CalendarEventHandler;
    private apiGestor: API_gestor;
    private events: Map<string, CalendarEvent> = new Map();

    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
    }

    public static getInstance(apiGestor: API_gestor): CalendarEventHandler {
        if (!CalendarEventHandler.instance) {
            CalendarEventHandler.instance = new CalendarEventHandler(apiGestor);
        }
        return CalendarEventHandler.instance;
    }

    /**
     * 
     * @returns a new id for a calendar event (actual timestamp)
     */
    public getNextCalendarEventId():string{
        return new Date().getTime().toString()
    }

    public async addOrUpdateEvent(licenseKey: string, event: CalendarEvent): Promise<baseResponse> {
        try {
            const response = await this.apiGestor.addOrUpdateCalendarEvent(licenseKey, event);
            if (!response.success) throw new Error(response.errorMessage);

            this.events.set(event.id, event);
            return { success: true, errorMessage: "" };
        } catch (err: any) {
            console.error("Error adding/updating calendar event:", err);
            return { success: false, errorMessage: err.message };
        }
    }

    public async removeEvent(licenseKey: string, eventId: string): Promise<baseResponse> {
        try {
            if (!this.events.has(eventId)) throw new Error(`Event with id ${eventId} does not exist.`);

            const response = await this.apiGestor.removeCalendarEvent(licenseKey, eventId);
            if (!response.success) throw new Error(response.errorMessage);

            this.events.delete(eventId);
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
        this.events.set(event.id,event);
        return event
    }
}
