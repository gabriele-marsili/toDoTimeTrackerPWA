<template>
    <NotificationManager ref="notificationManager" />
    <div class="todo-list-container" :class="viewMode">
        <!--<button @click="toggleViewMode" class="toggle-btn">
            {{ viewMode === 'list' ? 'Grid View' : 'List View' }}
        </button>
        -->
        <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item-wrapper">
            <ToDoItem :viewMode="viewMode" :todo="todo" @update="onItemUpdate" @delete="onItemDelete" @copy="onItemCopy"
                @click.stop />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref, onMounted } from 'vue';
import ToDoItem from './ToDoItem.vue';
import { ToDoAction, ToDoHandler } from '../engine/toDoEngine';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import NotificationManager from '../gestors/NotificationManager.vue';
export interface Props {
    todos: ToDoAction[];
    // viewMode: 'list' mostra ogni item in una riga,
    // viewMode: 'grid' mostra ogni item in un piccolo box
    viewMode: 'list' | 'grid';
}
const notificationManager = ref(null); // Riferimento per NotificationManager
const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor);
const todoHandler = ToDoHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
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
const viewMode = ref<'list' | 'grid'>('list');
//const toggleViewMode = () => viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';

const props = defineProps<Props>();


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


async function onItemDelete(todo: ToDoAction) {
    try {
        //remove by db:
        const deleteRes = await todoHandler.removeToDo(userInfo.value.licenseKey, todo.id)
        if (!deleteRes.success) {
            throw new Error(deleteRes.errorMessage)
        }
        //remove local : 
        const index = props.todos.findIndex(t => t.id == todo.id)
        console.log("index onItemDelete = ",index)
        if (index != -1) {
            props.todos.splice(index, 1)
        }
        sendNotify("success", `Successfully deleted to do : ${todo.title}`);
        
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
        //copy in db:
        const addCopyRes = await todoHandler.addOrUpdateToDo(userInfo.value.licenseKey, todo)
        if (!addCopyRes.success) {
            throw new Error(addCopyRes.errorMessage)
        }
        //copy local : 
        props.todos.push(todo)
        sendNotify("success", `Successfully copyed to do : ${todo.title}`);
    } catch (error: any) {
        sendNotify("error", "Error copying to do : " + error.message)
    }
}

async function onItemUpdate(updated: ToDoAction) {
    try {
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
        sendNotify("success", `Successfully updated to do : ${updated.title}`);
    } catch (error: any) {
        sendNotify("error", "Error updating to do : " + error.message)
    }
}

onMounted(async () => {
    //to do : da togliere da qui (serve solo per debug)
    await api_gestor.loginWithLicenseKey("FN9F-VDNN-IQEQ-X8E0")

    userInfo.value = userHandler.getUserInfo(true).userInfo_DB
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
</style>
