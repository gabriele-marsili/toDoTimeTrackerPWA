import { TTT_Notification } from "./notification.js";

export type CalendarObj = {
    eventDate: Date;
    title: string;
    description: string;
    notifications: TTT_Notification[];
    category: string;
    durationInH: number;
};

export class CalendarEvent {
    public eventDate: Date;
    public title: string;
    public description: string;
    public notifications: TTT_Notification[];
    public category: string;
    public durationInH: number;
    public id:string;

    constructor(
        id:string,
        eventDate: Date,
        title: string,
        description: string,
        notifications: TTT_Notification[] = [],
        category: string = '',
        durationInH: number = 1
    ) {
        this.id = id;
        this.eventDate = eventDate;
        this.title = title;
        this.description = description;
        this.notifications = notifications;
        this.category = category;
        this.durationInH = durationInH;
    }

    public getAsObj(): CalendarObj {
        return {
            eventDate: this.eventDate,
            title: this.title,
            description: this.description,
            notifications: this.notifications,
            category: this.category,
            durationInH: this.durationInH,
        };
    }
}
