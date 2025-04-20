import { API_gestor } from "../backend-comunication/api_comunication.js";
import { baseResponse } from "../types/utilityTypes.js";
export type ToDoPriority = 1 | 2 | 3 | 4 | 5;
export type ToDoObj = {
    title: string;
    description: string;
    priority: ToDoPriority;
    dateWithTime: Date;
    expiration: Date;
    notifyDate: Date;
    subActions: ToDoObj[];
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
    clone(id?: string | null): ToDoAction;
}
/**
 * Singleton class to handle to do actions con integrazione col backend.
 */
export declare class ToDoHandler {
    private static instance;
    private apiGestor;
    private fcmToken;
    private todos;
    private constructor();
    static getInstance(apiGestor: API_gestor): ToDoHandler;
    /**
     *
     * @returns a new id for a to do (actual timestamp)
     */
    getNextToDoId(): string;
    private checkFcmToken;
    /**
     * add a new ToDoAction:
     * - comunicate with API_gestor (backend)
     * - add the to do in local
     *
     * @param licenseKey (id doc)
     * @param todo istance of ToDoAction to add
     */
    addOrUpdateToDo(licenseKey: string, todo: ToDoAction): Promise<baseResponse>;
    /**
     * remove a ToDoAction:
     * - comunicate with API_gestor (backend)
     * - delete the to do in local
     *
     * @param licenseKey (id doc)
     * @param id istance of ToDoAction to remove
     */
    removeToDo(licenseKey: string, id: string): Promise<baseResponse>;
    /**
     * return a ToDoAction by the local map
     *
     * @param id ID of the ToDoAction to get
     * @returns the istance of ToDoAction or undefined
     */
    getToDo(id: string): ToDoAction | undefined;
    /**
     * return all the ToDoActions memorized in local
     *
     * @returns array of ToDoAction.
     */
    getAllToDos(): ToDoAction[];
    /**
     * load all the ToDoActions by the DB and update them in local
     *
     * @param licenseKey (id doc)
     */
    loadAllToDos(licenseKey: string): Promise<{
        success: boolean;
        errorMessage: string;
        toDos: ToDoObj[];
    }>;
    /**
     * convert a ToDoObj in an istance of ToDoAction.
     *
     * @param toDoObj obj to convert
     * @returns istance of ToDoAction
     */
    fromToDoObj(toDoObj: ToDoObj): ToDoAction;
}
