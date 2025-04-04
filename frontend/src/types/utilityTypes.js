export class ToDoAction {
    title;
    description;
    priority;
    dateWithTime; //data (+orario) dell'evento
    expiration; //scadenza 
    notifyDate; //default = all'ora dell'evento
    subActions;
    ;
    completed;
    id;
    constructor(id, title, priority, dateWithTime, expiration, notifyDate, description = "") {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.expiration = expiration;
        this.notifyDate = notifyDate;
        this.subActions = new Map();
        this.dateWithTime = dateWithTime;
        this.completed = false;
    }
    getAsObj() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            priority: this.priority,
            dateWithTime: this.dateWithTime,
            expiration: this.expiration,
            notifyDate: this.notifyDate,
            subActions: this.subActions,
            completed: this.completed
        };
    }
    isCompleted() {
        return this.completed;
    }
    addOrUpdateSubToDoAction(SubToDoAction) {
        this.subActions.set(SubToDoAction.id, SubToDoAction);
    }
    removeSubToDoAction(subActionId) {
        this.subActions.delete(subActionId);
    }
    setAsCompleted() {
        this.completed = true;
        this.subActions.forEach(a => a.setAsCompleted());
    }
    setAsNotCompleted() {
        this.completed = false;
    }
}
