<template>
    <NotificationManager ref="notificationManager" />
    <div class="todo-list-container" :class="viewMode">
        <!--<button @click="toggleViewMode" class="toggle-btn">
            {{ viewMode === 'list' ? 'Grid View' : 'List View' }}
        </button>
        -->
        <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item-wrapper">
            <ToDoItem :user-categories="userInfo.categories" :viewMode="viewMode" :todo="todo"
                @todoEvent="passToDoEvent" @update="onItemUpdate" @delete="onItemDelete" @copy="onItemCopy"
                @addSubToDo="onItemAddSubToDo" @send-notify="handleSendNotifyByToDoItem" @click.stop />
        </div>

        <!-- add to do box -->
        <div v-if="isAddToDoBoxOpened" class="modal">
            <div class="content">
                <h3>{{ parentToDoId != "" ? "Add New Sub To Do Action" : "Add New To Do Action" }}</h3>
                <div class="form-group">
                    <label for="todo_title">Title:</label>
                    <input id="todo_title" class="baseInputField" type="text" v-model="localTitle"
                        placeholder="Title" />
                </div>

                <div class="form-group">
                    <label for="todo_category">Category:</label>
                    <input id="todo_category" class="baseInputField" type="text" v-model="localCategory"
                        placeholder="Category" />
                </div>

                <div class="form-group">
                    <label for="todo_description">Description:</label>
                    <input id="todo_description" class="baseInputField" type="text" v-model="localDescription"
                        placeholder="Description" />
                </div>

                <div class="form-group">
                    <label for="todo_priority">Priority:</label>
                    <select class="selettore" id="todo_priority" v-model.number="localPriority">
                        <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Date:</label>
                    <DatePicker :isDarkMode=isDarkMode v-model="localDateWithTime" />
                </div>

                <div class="form-group">
                    <label>Expiration:</label>
                    <DatePicker :isDarkMode=isDarkMode v-model="localExpiration" />
                </div>

                <div class="form-group">
                    <label>Notify Date:</label>
                    <DatePicker :isDarkMode=isDarkMode v-model="localNotifyDate" />
                </div>

                <div class="button-actions">
                    <button class="baseButton" @click="addToDo">
                        {{ parentToDoId != "" ? "Add SubAction" : "Add New ToDo" }}
                        <span class="material-symbols-outlined g-icon">add</span>
                    </button>

                    <button class="baseButton" @click="resetLocalValues">Cancel
                        <span class="material-symbols-outlined g-icon">cancel</span>
                    </button>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, onMounted } from 'vue';
import ToDoItem from './ToDoItem.vue';
import { ToDoAction, ToDoHandler, ToDoPriority } from '../engine/toDoEngine';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import NotificationManager from '../gestors/NotificationManager.vue';
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
import DatePicker from './DatePicker.vue';

export interface Props {
    todos: ToDoAction[];
    // viewMode: 'list' mostra ogni item in una riga,
    // viewMode: 'grid' mostra ogni item in un piccolo box
    viewMode: 'list' | 'grid';
    isSubList: boolean
}
const notificationManager = ref(null); // Riferimento per NotificationManager
const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor);
const todoHandler = ToDoHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
const isAddToDoBoxOpened = ref(false)
const userInfo = ref<userDBentry>({
    username: "",
    avatarImagePath: defaultImagePath,
    age: 1,
    categories: [],
    createdAt: new Date(),
    email: "",
    firstName: "",
    lastName: "",
    licenseIsValid: false,
    licenseKey: "",
    notifications: false,
    permissions: false,
    phone: "",
    timeTrackerActive: false,
    karmaCoinsBalance: 0,
    friends: [],
});
const router = useRouter();
const emit = defineEmits(["subToDoNotify","todoEvent", "subToDoEvent"])
const viewMode = ref<'list' | 'grid'>('list');
//const toggleViewMode = () => viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';

const props = defineProps<Props>();

const parentToDoId = ref("")
const localPriority = ref<ToDoPriority>(1);
const localDescription = ref("")
const localTitle = ref("")
const localCategory = ref("")
const localExpiration = ref(new Date())
const localNotifyDate = ref(new Date())
const localDateWithTime = ref(new Date())


const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

// Filtra i todo che non sono completati
const filteredTodos = computed(() => {
    return [...props.todos].sort((a, b) => {
        if (!a.isCompleted() && b.isCompleted()) return -1;
        if (a.isCompleted() && !b.isCompleted()) return 1;
        return 0;
    });
});

function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
    if (notificationManager.value) {
        (notificationManager.value as any).showNotification({
            type: type,
            message: text,
        })
    } else {
        console.log("notification manager not found")
    }
}

function passToDoEvent(eventContent: { type: string, newToDoQuantity: number }) {
    emit("todoEvent", eventContent)
}

function resetLocalValues() {
    localPriority.value = 1
    localDateWithTime.value = new Date()
    localDescription.value = ""
    localTitle.value = ""
    localCategory.value = ""
    localExpiration.value = new Date()
    localNotifyDate.value = new Date()
    parentToDoId.value = ""
    isAddToDoBoxOpened.value = false;
}

function onItemAddSubToDo(todo_id: string) {
    isAddToDoBoxOpened.value = true
    parentToDoId.value = todo_id
}

async function addToDo() {
    try {
        let errors: string[] = []
        if (localTitle.value == "") {
            errors.push("the ToDo must have a title")
        }
        if (localCategory.value == "") {
            errors.push("the ToDo must have a category")
        }

        if (errors.length > 0) {
            throw new Error(errors[0])
        }
        //to do : get id by to do handler (api gestor)    
        const toDoToAdd = new ToDoAction(
            "345678",
            localTitle.value,
            localPriority.value,
            localDateWithTime.value,
            localExpiration.value,
            localNotifyDate.value,
            localCategory.value,
            localDescription.value
        )

        if (parentToDoId.value != "") { //add sub action
            const index = props.todos.findIndex(todo => todo.id == parentToDoId.value)
            if (index < 0) {
                throw new Error("parent to do not found: can't add sub action")
            }
            props.todos[index].addOrUpdateSubToDoAction(toDoToAdd)

            //update (parent to do) in db:
            const updateRes = await todoHandler.addOrUpdateToDo(userInfo.value.licenseKey, props.todos[index])
            if (!updateRes.success) {
                throw new Error(updateRes.errorMessage)
            }

            sendNotify("success", `Successfully addedd sub action : ${toDoToAdd.title}`);
        } else { //add a new to do
            //add in db:
            const addRes = await todoHandler.addOrUpdateToDo(userInfo.value.licenseKey, toDoToAdd)
            if (!addRes.success) {
                throw new Error(addRes.errorMessage)
            }
            //add local : 
            props.todos.push(toDoToAdd)
            sendNotify("success", `Successfully addedd to do : ${toDoToAdd.title}`);
        }

    } catch (error: any) {
        sendNotify("error", "Error adding to do : " + error.message)
    } finally {
        resetLocalValues()
    }
}

async function onItemDelete(todo: ToDoAction) {
    try {
        if (props.isSubList) { //pass the event to to-do item
            emit("subToDoEvent", { type: "delete", todo })
            return;
        }

        //remove by db:
        const deleteRes = await todoHandler.removeToDo(userInfo.value.licenseKey, todo.id)
        if (!deleteRes.success) {
            throw new Error(deleteRes.errorMessage)
        }
        //remove local : 
        const index = props.todos.findIndex(t => t.id == todo.id)
        console.log("index onItemDelete = ", index)
        if (index != -1) {
            props.todos.splice(index, 1)
        }
        sendNotify("success", `Successfully deleted to do : ${todo.title}`);
        emit("todoEvent", { type: "delete to do", newToDoQuantity: props.todos.length })

    } catch (error: any) {
        sendNotify("error", "Error deleting to do : " + error.message)
    }
}

async function onItemCopy(todo: ToDoAction) {
    try {
        console.log("props.todos:\n", props.todos)
        console.log("todo.id:\n", todo.id)
        const index = props.todos.findIndex(t => t.id == todo.id)
        if (index != -1) {
            throw new Error("Duplicate to do id")
        }

        if (props.isSubList) { //pass the event to to-do item
            emit("subToDoEvent", { type: "copy", todo })
            return;
        }

        //copy in db:
        const addCopyRes = await todoHandler.addOrUpdateToDo(userInfo.value.licenseKey, todo)
        if (!addCopyRes.success) {
            throw new Error(addCopyRes.errorMessage)
        }
        //copy local : 
        props.todos.push(todo)
        sendNotify("success", `Successfully copyed to do : ${todo.title}`);
        emit("todoEvent", { type: "copy to do", newToDoQuantity: props.todos.length })
    } catch (error: any) {
        sendNotify("error", "Error copying to do : " + error.message)
    }
}

async function onItemUpdate(content: { updated: ToDoAction, karmaCoinsChange: 0 }) {
    try {
        const updated = content.updated
        const karmaCoinsChange = content.karmaCoinsChange
        console.log("is sub list ? ", props.isSubList)
        console.log("updating to do:\n", updated)
        console.log("karmaCoinsChange = ", karmaCoinsChange)

        if (props.isSubList) { //pass the event to to-do item
            emit("subToDoEvent", { type: "update", todo: updated, karmaCoinsChange })
            return;
        }

        //update in db:
        const updateRes = await todoHandler.addOrUpdateToDo(userInfo.value.licenseKey, updated)
        if (!updateRes.success) {
            throw new Error(updateRes.errorMessage)
        }
        //update local : 
        const index = props.todos.findIndex(t => t.id == updated.id)
        if (index != -1) {
            props.todos[index] = updated
        }

        if (karmaCoinsChange == 0) { //updated (non settata come completata / non completata)
            sendNotify("success", `Successfully updated to do : ${updated.title}`);
        } else { //emit ad home per cambiamento karma coins balance (locale e su db)
            emit("todoEvent", { type: "todo completed or not completed", newToDoQuantity: -1, karmaCoinsChange })
        }

    } catch (error: any) {
        sendNotify("error", "Error updating to do : " + error.message)
    }
}

function handleSendNotifyByToDoItem(notifyContent:{type:"success"|"info"|"warning"|"error",text:string}){
    if(props.isSubList){ //pass to parent component (to do item)
        emit("subToDoNotify", notifyContent)
    }else{ //to do list = root component => send notify 
        sendNotify(notifyContent.type,notifyContent.text);
    }
}

onMounted(async () => {
    const userInfoRes = await userHandler.getUserInfo(true)
    console.log("userInfoRes (to do list):\n", userInfoRes)
    if (!userInfoRes.userInfo_DB) { // => user not logged 
        //redirect to welcome
        await delay(2000)
        //redirect to welcome
        router.push("/welcome")
    }

    userInfo.value = userInfoRes.userInfo_DB
})
</script>

<style scoped>
.todo-list-container {
    max-height: 500px;
    overflow-y: auto;
}

.todo-list.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.todo-list.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
}

.toggle-btn {
    margin-bottom: 10px;
}

.todo-list-container::-webkit-scrollbar {
    display: none;
}

.content {
    background: #212121;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-y: auto;
    text-align: center;
    border: 1px solid #15b680d4;
}

.content h3 {
    margin-bottom: 10px;
}

.content::-webkit-scrollbar {
    display: none;
}

.button-actions {
    margin-top: 3%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    /* Eventuali altre proprietà per modificare colore, dimensioni, margini dell’icona */
}
</style>
