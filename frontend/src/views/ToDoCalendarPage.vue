<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="calendar-app">
        <Sidebar :activeSection="'calendar_and_todo'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <header class="header-section box elevated shadow-lg rounded-2xl">

                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">task</span>
                    <span>Total To-Dos : </span>
                    <span class="value"> {{ totalToDoQuantity }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">task</span>
                    <span>Today To-Dos : </span>
                    <span class="value"> {{ todayToDoActions.length }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">event</span>
                    <span>Total Events : </span>
                    <span class="value"> {{ totalEventsQuantity }}</span>
                </div>
                <div class="header-item">
                    <span class="material-symbols-outlined icon">event</span>
                    <span>Today Events : </span>
                    <span class="value"> {{ todayEventsQuantity }}</span>
                </div>
                <button class="baseButton" @click="addToDoTrigger = true">
                    <i class="material-icons-sharp">add</i>
                    Add New To Do
                </button>

            </header>

            <div class="content-row">
                <!-- Colonna 1: Today To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Today To Do</h3>
                    <ToDoList :triggerAddToDo="false" :is-sub-list="false" :todos=todayToDoActions @todoEvent=handleToDoEvent viewMode="grid">
                    </ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList @todoAdded="handleAddToDo" :triggerAddToDo="addToDoTrigger" :is-sub-list="false" @todoEvent=handleToDoEvent :todos=genericToDoActions viewMode="grid">
                    </ToDoList>
                </div>
            </div>

            <div class="footer elevated p-15 shadow-lg rounded-2xl text-center">
                <h3>Calendar</h3>
                <Calendar @calendarEvent=handleCalendarEvent></Calendar>
            </div>
        </div>

    </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import Calendar from '../components/Calendar.vue';
import Sidebar from '../components/Sidebar.vue';
import { ToDoAction, ToDoHandler, ToDoObj } from '../engine/toDoEngine';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import { useRouter } from 'vue-router';
import { delay, isToday } from '../utils/generalUtils';
import ToDoList from '../components/ToDoList.vue';
const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const todayToDoActions = ref<ToDoAction[]>([]);
const genericToDoActions = ref<ToDoAction[]>([]);
const api_gestor = API_gestor.getInstance()
const todoHandler = ToDoHandler.getInstance(api_gestor)
const userHandler = UserHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
const todoCompletedQuantity = ref(0);
const totalToDoQuantity = ref(0);
const totalEventsQuantity = ref(0);
const todayEventsQuantity = ref(0);
const addToDoTrigger = ref(false);

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
    fcmToken: ""
});

const router = useRouter();

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

async function askToDo() {
    try {
        const toDOres = await todoHandler.loadAllToDos(userInfo.value.licenseKey)
        if (toDOres.success) {
            const todoList = toDOres.toDos
            console.log("todoList:\n", todoList)
            const countToDoQuantity = (todo_list: ToDoObj[]): number => {
                let q = 0;
                for (let to_do of todo_list.filter(t => !t.completed)) { //scorro to do non completate 
                    q += 1 //incremento quantity q
                    if (to_do.subActions.length > 0) { //se to do ha sub actions 
                        //incremento q sfruttando ricorsione su sub actions 
                        q += countToDoQuantity(to_do.subActions)
                    }
                }
                return q;
            }

            totalToDoQuantity.value = countToDoQuantity(toDOres.toDos);

            todayToDoActions.value = []
            genericToDoActions.value = []
            todoCompletedQuantity.value = 0

            for (let to_do of todoList) {
                if (to_do.completed) {
                    todoCompletedQuantity.value++
                }
                const toDoAction = todoHandler.fromToDoObj(to_do)
                console.log("toDoAction:\n", toDoAction)
                if (isToday(toDoAction.dateWithTime)) {
                    todayToDoActions.value.push(toDoAction)
                }
                genericToDoActions.value.push(toDoAction)
            }
        } else {
            throw new Error(toDOres.errorMessage);
        }
    } catch (error: any) {
        sendNotify("error", `Error obtaining todo actions : ${error.message} `)
    }
}

async function askUserInfo() {
    const userInfoRes = await userHandler.getUserInfo(true)
    console.log("userInfoRes (to do + calendar page):\n", userInfoRes)
    if (!userInfoRes.userInfo_DB) { // => user not logged 
        sendNotify("warning", "Not logged, please log in")
        await delay(1500)
        //redirect to welcome
        router.push("/welcome")
        return;
    }

    userInfo.value = userInfoRes.userInfo_DB
    if (userInfo.value.avatarImagePath == "") {
        userInfo.value.avatarImagePath = defaultImagePath
    }
}

const handleSectionChange = (newSection: any) => {
    console.log(`Navigating to section: ${newSection}`);
};

function handleCalendarEvent(eventContent: { type: string, newEventsQuantity: number }) {
    console.log("new calendar event : ", eventContent)
}

async function handleToDoEvent(eventContent: { type: string, newToDoQuantity: number, karmaCoinsChange: undefined | number }) {
    console.log("eventContent:\n", eventContent)
    if (eventContent.karmaCoinsChange !== undefined && userInfo.value) {
        userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange;
    }
    await askToDo()
}

async function handleAddToDo(result:{success:boolean, error:string}) {  
  addToDoTrigger.value = false;

  if (result.success) {
    await askToDo()
  } else {
    console.log("add to do failer or aborted, err: ", result.error);
  }
}

onMounted(async () => {
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }


    await askUserInfo()
    await askToDo()
});
</script>

<style scoped>
.calendar-app {
    display: flex;
    width: 100vw;
    height: 102vh;
    overflow-y: hidden;
    overflow: hidden;
    border: 2px solid #1e1e1e;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: 5%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    height: auto;
    min-height: 0;
}

.content-row {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 3%;
    height: 20%;
    min-height: 0;
    margin-left: 2%;
    width: 100%;
    margin-bottom: 1%;
}


.box {
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    height: 10%;
    width: 95%;
    display: flex;
    flex-direction: column;
}

.content-row .box {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    min-width: 47%;
}

.header-area {
    flex: 1;
    margin-left: 2%;
    min-width: 100%;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    overflow-y: auto;
    font-family: 'Poppins', sans-serif;
    height: 20%;
}

.header-section {
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    margin-top: 2%;
    width: 97%;
    background-color: var(--background-dark);
    color: var(--text-color);
    flex-wrap: wrap;
    gap: 5%;
    margin-left: 2%;
    margin-bottom: 1%;
}

.header-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 0.9em;
}

.header-item .value {
    font-weight: bold;
    margin-left: 3px;
}

.icon {
    font-size: 2em;
    margin-right: 2px;
    color: #FFD700;
}

.footer {
    margin-top: 10px;
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    height: 35vh;
    box-sizing: border-box;
    width: 97%;
    margin-left: 2%;
    overflow-y: auto;
    margin-bottom: 2%;
}

.footer::-webkit-scrollbar {
    display: none;
}


</style>