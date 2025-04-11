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
    category;
    constructor(id, title, priority, dateWithTime, expiration, notifyDate, category, description = "") {
        this.id = id;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.expiration = expiration;
        this.notifyDate = notifyDate;
        this.subActions = new Map();
        this.dateWithTime = dateWithTime;
        this.completed = false;
        this.category = category;
    }
    getAsObj() {
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
/**
 * Singleton class to handle to do actions con integrazione col backend.
 */
export class ToDoHandler {
    static instance;
    apiGestor;
    // Mappa locale per memorizzare le ToDoAction indicizzate per ID
    todos = new Map();
    constructor(apiGestor) {
        this.apiGestor = apiGestor;
    }
    static getInstance(apiGestor) {
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
    async addToDo(licenseKey, todo) {
        try {
            if (this.todos.has(todo.id)) {
                throw new Error(`ToDo with id ${todo.id} already exists.`);
            }
            const response = await this.apiGestor.addToDoAction(licenseKey, todo);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            this.todos.set(todo.id, todo);
            return {
                success: true,
                errorMessage: ""
            };
        }
        catch (error) {
            console.log("error in add to do:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    /**
     * update a ToDoAction:
     * - comunicate with API_gestor (backend)
     * - update the to do in local
     *
     * @param licenseKey (id doc)
     * @param todo istance of ToDoAction to update
     */
    async updateToDo(licenseKey, todo) {
        try {
            if (!this.todos.has(todo.id)) {
                throw new Error(`ToDo with id ${todo.id} does not exist.`);
            }
            const response = await this.apiGestor.updateToDoAction(licenseKey, todo);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            this.todos.set(todo.id, todo);
            return {
                success: true,
                errorMessage: ""
            };
        }
        catch (error) {
            console.log("error in update to do:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
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
    async removeToDo(licenseKey, id) {
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
            };
        }
        catch (error) {
            console.log("error in remove to do:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    /**
     * return a ToDoAction by the local map
     *
     * @param id ID of the ToDoAction to get
     * @returns the istance of ToDoAction or undefined
     */
    getToDo(id) {
        return this.todos.get(id);
    }
    /**
     * return all the ToDoActions memorized in local
     *
     * @returns array of ToDoAction.
     */
    getAllToDos() {
        return Array.from(this.todos.values());
    }
    /**
     * load all the ToDoActions by the DB and update them in local
     *
     * @param licenseKey (id doc)
     */
    async loadAllToDos(licenseKey) {
        try {
            const response = await this.apiGestor.getToDoActions(licenseKey);
            if (!response.success) {
                throw new Error(response.errorMessage);
            }
            //clear & update the local map
            this.todos.clear();
            response.toDoObjects.forEach((toDoObj) => {
                const action = this.fromToDoObj(toDoObj);
                this.todos.set(action.id, action);
            });
            return {
                success: true,
                errorMessage: ""
            };
        }
        catch (error) {
            console.log("error in load all todo:\n", error);
            return {
                success: false,
                errorMessage: error.message
            };
        }
    }
    /**
     * convert a ToDoObj in an istance of ToDoAction.
     *
     * @param toDoObj obj to convert
     * @returns istance of ToDoAction
     */
    fromToDoObj(toDoObj) {
        const action = new ToDoAction(toDoObj.id, toDoObj.title, toDoObj.priority, new Date(toDoObj.dateWithTime), new Date(toDoObj.expiration), new Date(toDoObj.notifyDate), toDoObj.category, toDoObj.description);
        action.completed = toDoObj.completed;
        // Se necessario, qui si potrebbe ricostruire la mappa subActions iterando sui dati di toDoObj.subActions
        action.subActions = toDoObj.subActions;
        return action;
    }
}
