import { API_gestor } from "../backend-comunication/api_comunication";

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
        return {
            category: this.category,
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
     * Aggiunge una nuova ToDoAction:
     * - Invia l'azione al backend tramite API_gestor.
     * - In caso di successo, la aggiunge alla mappa locale.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param todo Istanza di ToDoAction da aggiungere.
     */
    public async addToDo(licenseKey: string, todo: ToDoAction): Promise<void> {
        if (this.todos.has(todo.id)) {
            throw new Error(`ToDo with id ${todo.id} already exists.`);
        }
        const response = await this.apiGestor.addToDoAction(licenseKey, todo);
        if (!response.success) {
            throw new Error(response.errorMessage);
        }
        this.todos.set(todo.id, todo);
    }

    /**
     * Aggiorna una ToDoAction:
     * - Invia l'azione aggiornata al backend tramite API_gestor.
     * - Se la risposta è positiva, aggiorna la mappa locale.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param todo Istanza di ToDoAction da aggiornare.
     */
    public async updateToDo(licenseKey: string, todo: ToDoAction): Promise<void> {
        if (!this.todos.has(todo.id)) {
            throw new Error(`ToDo with id ${todo.id} does not exist.`);
        }
        const response = await this.apiGestor.updateToDoAction(licenseKey, todo);
        if (!response.success) {
            throw new Error(response.errorMessage);
        }
        this.todos.set(todo.id, todo);
    }

    /**
     * Rimuove una ToDoAction:
     * - Comunica al backend la rimozione tramite API_gestor.
     * - Se la rimozione sul DB ha successo, elimina l'azione dalla mappa locale.
     *
     * @param licenseKey Identificativo univoco per il documento.
     * @param id ID della ToDoAction da rimuovere.
     */
    public async removeToDo(licenseKey: string, id: string): Promise<void> {
        if (!this.todos.has(id)) {
            throw new Error(`ToDo with id ${id} does not exist.`);
        }
        const response = await this.apiGestor.removeToDoAction(licenseKey, id);
        if (!response.success) {
            throw new Error(response.errorMessage);
        }
        this.todos.delete(id);
    }

    /**
     * Restituisce una ToDoAction dalla mappa locale dato il suo ID.
     *
     * @param id ID della ToDoAction da ottenere.
     * @returns Istanza di ToDoAction oppure undefined se non presente.
     */
    public getToDo(id: string): ToDoAction | undefined {
        return this.todos.get(id);
    }

    /**
     * Restituisce tutte le ToDoActions memorizzate localmente.
     *
     * @returns Array di ToDoAction.
     */
    public getAllToDos(): ToDoAction[] {
        return Array.from(this.todos.values());
    }

    /**
     * Carica tutte le ToDoActions per una licenseKey dal DB e aggiorna la mappa locale.
     *
     * @param licenseKey Identificativo univoco per il documento.
     */
    public async loadAllToDos(licenseKey: string): Promise<void> {
        const response = await this.apiGestor.getToDoActions(licenseKey);
        if (!response.success) {
            throw new Error(response.errorMessage);
        }
        // Pulizia della mappa locale
        this.todos.clear();
        // Per ogni oggetto ottenuto, ricostruisce un'istanza ToDoAction e lo inserisce nella mappa
        response.toDoObjects.forEach((toDoObj) => {
            const action = this.fromToDoObj(toDoObj);
            this.todos.set(action.id, action);
        });
    }

    /**
     * Funzione helper che converte un oggetto di tipo ToDoObj in un'istanza di ToDoAction.
     *
     * @param toDoObj Oggetto da convertire.
     * @returns Istanza di ToDoAction.
     */
    private fromToDoObj(toDoObj: ToDoObj): ToDoAction {
        const action = new ToDoAction(
            toDoObj.id,
            toDoObj.title,
            toDoObj.priority,
            new Date(toDoObj.dateWithTime),
            new Date(toDoObj.expiration),
            new Date(toDoObj.notifyDate),
            toDoObj.category,
            toDoObj.description
        );
        action.completed = toDoObj.completed;
        // Se necessario, qui si potrebbe ricostruire la mappa subActions iterando sui dati di toDoObj.subActions
        action.subActions = toDoObj.subActions;
        return action;
    }
}