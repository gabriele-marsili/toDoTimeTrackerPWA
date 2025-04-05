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
    category: string;
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
    category: string;
    constructor(id: string, title: string, priority: ToDoPriority, dateWithTime: Date, expiration: Date, notifyDate: Date, category: string, description?: string);
    getAsObj(): ToDoObj;
    isCompleted(): boolean;
    addOrUpdateSubToDoAction(SubToDoAction: ToDoAction): void;
    removeSubToDoAction(subActionId: string): void;
    setAsCompleted(): void;
    setAsNotCompleted(): void;
}
