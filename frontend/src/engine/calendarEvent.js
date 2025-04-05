export class CalendarEvent {
    eventDate;
    title;
    description;
    notifications;
    category;
    durationInH;
    id;
    constructor(id, eventDate, title, description, notifications = [], category = '', durationInH = 1) {
        this.id = id;
        this.eventDate = eventDate;
        this.title = title;
        this.description = description;
        this.notifications = notifications;
        this.category = category;
        this.durationInH = durationInH;
    }
    getAsObj() {
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
