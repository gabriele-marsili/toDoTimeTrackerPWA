import { API_gestor } from "../backend-comunication/api_comunication.js";
import { baseResponse } from "../types/utilityTypes.js";

export type ToDoPriority = 1 | 2 | 3 | 4 | 5

export type ToDoObj = {
    title: string;
    description: string;
    priority: ToDoPriority;
    dateWithTime: Date; //data (+orario) dell'evento
    expiration: Date; //scadenza 
    notifyDate: Date; //default = all'ora dell'evento
    subActions: ToDoObj[]
    completed: boolean;
    id: string
    category: string
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
    public category: string

    constructor(id: string, title: string, priority: ToDoPriority, dateWithTime: Date, expiration: Date, notifyDate: Date, category: string, description = "") {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.expiration = expiration;
        this.notifyDate = notifyDate;
        this.subActions = new Map<string, ToDoAction>();
        this.dateWithTime = dateWithTime;
        this.completed = false;
        this.category = category;
    }

    public getAsObj(): ToDoObj {
        let subActionsObj: ToDoObj[] = []
        for (let a of this.subActions.values()) {
            subActionsObj.push(a.getAsObj())
        }

        return {
            category: this.category,
            id: this.id,
            title: this.title,
            description: this.description,
            priority: this.priority,
            dateWithTime: this.dateWithTime,
            expiration: this.expiration,
            notifyDate: this.notifyDate,
            subActions: subActionsObj,
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

    public clone(): ToDoAction {
        // Crea una nuova istanza con le stesse proprietà base.
        const cloned = new ToDoAction(
            this.id,
            this.title,
            this.priority,
            new Date(this.dateWithTime.getTime()),
            new Date(this.expiration.getTime()),
            new Date(this.notifyDate.getTime()),
            this.category,
            this.description
        );
        cloned.completed = this.completed;

        // Copia ricorsivamente le sub-actions.
        this.subActions.forEach((subAction) => {
            cloned.subActions.set(subAction.id, subAction.clone());
        });
        return cloned;
    }

}


/**
 * Singleton class to handle to do actions con integrazione col backend.
 */
export class ToDoHandler {
    private static instance: ToDoHandler;
    private apiGestor: API_gestor;

    // Mappa locale per memorizzare le ToDoAction indicizzate per ID
    private todos: Map<string, ToDoAction> = new Map<string, ToDoAction>();

    private constructor(apiGestor: API_gestor) {
        this.apiGestor = apiGestor;
    }

    public static getInstance(apiGestor: API_gestor): ToDoHandler {
        if (!ToDoHandler.instance) {
            ToDoHandler.instance = new ToDoHandler(apiGestor);
        }
        return ToDoHandler.instance;
    }

    /**
     * add a new ToDoAction:
     * - comunicate with API_gestor (backend)
     * - add the to do in local
     *
     * @param licenseKey (id doc)
     * @param todo istance of ToDoAction to add
     */
    public async addOrUpdateToDo(licenseKey: string, todo: ToDoAction): Promise<baseResponse> {
        try {
            const response = await this.apiGestor.addOrUpdateToDoAction(licenseKey, todo);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            this.todos.set(todo.id, todo); // add / update local
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.log("error in add to do:\n", error)
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    /**
     * remove a ToDoAction:
     * - comunicate with API_gestor (backend)
     * - delete the to do in local
     *
     * @param licenseKey (id doc)
     * @param id istance of ToDoAction to remove
     */
    public async removeToDo(licenseKey: string, id: string): Promise<baseResponse> {
        try {
            if (!this.todos.has(id)) {
                throw new Error(`ToDo with id ${id} does not exist.`);
            }
            const response = await this.apiGestor.removeToDoAction(licenseKey, id);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            this.todos.delete(id);
            return {
                success: true,
                errorMessage: ""
            }
        } catch (error: any) {
            console.log("error in remove to do:\n", error)
            return {
                success: false,
                errorMessage: error.message
            }
        }
    }

    /**
     * return a ToDoAction by the local map
     *
     * @param id ID of the ToDoAction to get
     * @returns the istance of ToDoAction or undefined
     */
    public getToDo(id: string): ToDoAction | undefined {
        return this.todos.get(id);
    }

    /**
     * return all the ToDoActions memorized in local
     *
     * @returns array of ToDoAction.
     */
    public getAllToDos(): ToDoAction[] {
        return Array.from(this.todos.values());
    }

    /**
     * load all the ToDoActions by the DB and update them in local
     *
     * @param licenseKey (id doc)
     */
    public async loadAllToDos(licenseKey: string): Promise<{
        success: boolean,
        errorMessage: string,
        toDos: ToDoObj[]
    }> {
        try {

            const response = await this.apiGestor.getToDoActions(licenseKey);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            //clear & update the local map
            this.todos.clear();
            for (let toDoObj of response.toDoObjects) {
                const action = this.fromToDoObj(toDoObj);
                this.todos.set(action.id, action);
            }
            return {
                success: true,
                errorMessage: "",
                toDos: response.toDoObjects
            }
        } catch (error: any) {
            console.log("error in load all todo:\n", error)
            return {
                success: false,
                errorMessage: error.message,
                toDos: []
            }
        }
    }

    /**
     * convert a ToDoObj in an istance of ToDoAction.
     *
     * @param toDoObj obj to convert
     * @returns istance of ToDoAction
     */
    public fromToDoObj(toDoObj: ToDoObj): ToDoAction {
        const action = new ToDoAction(
            toDoObj.id,
            toDoObj.title,
            toDoObj.priority,
            toDoObj.dateWithTime,
            toDoObj.expiration,
            toDoObj.notifyDate,
            toDoObj.category,
            toDoObj.description
        );
        action.completed = toDoObj.completed;

        for (let a of toDoObj.subActions) {
            let todoA = this.fromToDoObj(a)
            action.subActions.set(todoA.id, todoA)

        }

        this.todos.set(action.id, action);
        return action;
    }
}