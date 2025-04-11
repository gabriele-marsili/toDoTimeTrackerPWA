import { TTT_Notification } from "./notification.js";
export type CalendarObj = {
    eventDate: Date;
    title: string;
    description: string;
    notifications: TTT_Notification[];
    category: string;
    durationInH: number;
};
export declare class CalendarEvent {
    eventDate: Date;
    title: string;
    description: string;
    notifications: TTT_Notification[];
    category: string;
    durationInH: number;
    id: string;
    constructor(id: string, eventDate: Date, title: string, description: string, notifications?: TTT_Notification[], category?: string, durationInH?: number);
    getAsObj(): CalendarObj;
}
