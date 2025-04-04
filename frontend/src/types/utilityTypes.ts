export type baseResponse = {
    success: boolean,
    errorMessage: string
}

export type broadcastMessageType = "offline"
export type broadcastChannelMessage = {
    type: broadcastMessageType,
    content: any
}

export type ToDoPriority = 1 | 2 | 3 | 4 | 5

export type ToDoObj = {
    title: string;
    description: string;
    priority: ToDoPriority;
    dateWithTime: Date; //data (+orario) dell'evento
    expiration: Date; //scadenza 
    notifyDate: Date; //default = all'ora dell'evento
    subActions: Map<string, ToDoAction>;
    completed: boolean;
    id: string
}

export class ToDoAction { //OSS : attributi public per Vue
    public title: string;
    public description: string;
    public priority: ToDoPriority;
    public dateWithTime: Date; //data (+orario) dell'evento
    public expiration: Date; //scadenza 
    public notifyDate: Date; //default = all'ora dell'evento
    public subActions: Map<string, ToDoAction>;;
    public completed: boolean
    public id: string;
    constructor(id: string, title: string, priority: ToDoPriority, dateWithTime: Date, expiration: Date, notifyDate: Date, description = "",) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.expiration = expiration;
        this.notifyDate = notifyDate;
        this.subActions = new Map<string,ToDoAction>();
        this.dateWithTime = dateWithTime;
        this.completed = false;
    }

    public getAsObj(): ToDoObj {
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
        }
    }

    
    public isCompleted() {
        return this.completed;
    }

    
    public addOrUpdateSubToDoAction(SubToDoAction: ToDoAction) {
        this.subActions.set(SubToDoAction.id, SubToDoAction);        
    }

    public removeSubToDoAction(subActionId: string) {
        this.subActions.delete(subActionId)        
    }

    public setAsCompleted() {
        this.completed = true;
        this.subActions.forEach(a => a.setAsCompleted());
    }

    public setAsNotCompleted() {
        this.completed = false;
    }
}