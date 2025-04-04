export type baseResponse = {
    success: boolean;
    errorMessage: string;
};
export type broadcastMessageType = "offline";
export type broadcastChannelMessage = {
    type: broadcastMessageType;
    content: any;
};
export type ToDoPriority = 1 | 2 | 3 | 4 | 5;
export type ToDoObj = {
    title: string;
    description: string;
    priority: ToDoPriority;
    dateWithTime: Date;
    expiration: Date;
    notifyDate: Date;
    subActions: Map<string, ToDoAction>;
    completed: boolean;
    id: string;
};
export declare class ToDoAction {
    title: string;
    description: string;
    priority: ToDoPriority;
    dateWithTime: Date;
    expiration: Date;
    notifyDate: Date;
    subActions: Map<string, ToDoAction>;
    completed: boolean;
    id: string;
    constructor(id: string, title: string, priority: ToDoPriority, dateWithTime: Date, expiration: Date, notifyDate: Date, description?: string);
    getAsObj(): ToDoObj;
    isCompleted(): boolean;
    addOrUpdateSubToDoAction(SubToDoAction: ToDoAction): void;
    removeSubToDoAction(subActionId: string): void;
    setAsCompleted(): void;
    setAsNotCompleted(): void;
}
