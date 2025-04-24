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


                <div class="custom-select">
                    <span class="material-symbols-outlined menu-icon select-icon">visibility</span>
                    <select class="selettore" name="todo-view-mode" id="todo_view_mode" v-model="todo_view_mode">
                        <option :key="'list'" :value="'list'">List</option>
                        <option :key="'grid'" :value="'grid'">Grid</option>
                    </select>
                </div>




            </header>

            <div class="content-row" v-if="todo_view_mode == 'list'">
                <!-- Colonna 1: Today To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Today To Do</h3>
                    <ToDoList :triggerAddToDo="false" :is-sub-list="false" :todos=todayToDoActions
                        @todoEvent=handleToDoEvent :viewMode="'list'">
                    </ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList @todoAdded="handleAddToDo" :triggerAddToDo="addToDoTrigger" :is-sub-list="false"
                        @todoEvent=handleToDoEvent :todos=genericToDoActions :viewMode="'list'">
                    </ToDoList>
                </div>
            </div>

            <!-- box con to do grid (settimana, divise per giorno) -->
            <div v-if="todo_view_mode === 'grid'" class="todo-grid-box rounded-2xl elevated shadow-lg text-center">
                <!-- Navigation for weeks -->
                <div class="grid-todo-header week-nav flex justify-between items-center mb-4">
                    <button @click="prevWeek" class="baseButton">«</button>
                    <h3 class="text-lg font-medium">
                        {{ format(currentWeekStart, 'MMM dd, yyyy') }} -
                        {{ format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy') }}
                    </h3>
                    <button @click="nextWeek" class="baseButton">»</button>
                </div>

                <!-- Grid of days -->
                <div class="todo-grid-container hide-scrollbar">
                    <div v-for="day in weekDays" :key="day" class="day-column flex flex-col">
                        <div class="day-header text-sm font-semibold mb-2">
                            {{ format(day, 'EEEE') }}
                        </div>

                        <div class="todos-wrapper flex-1 overflow-y-auto hide-scrollbar ">
                            <ToDoList @todoAdded="handleAddToDo"
                                :triggerAddToDo="day.getDay() === 1 ? addToDoTrigger : false" :is-sub-list="false"
                                @todoEvent=handleToDoEvent :todos=todosForDay(day) :viewMode="'list'">
                            </ToDoList>
                        </div>

                    </div>
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
import { startOfWeek, addDays, endOfWeek, format } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
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
const todo_view_mode = ref<"grid" | "list">("list");
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))

const weekDays = computed(() =>
    Array.from({ length: 7 }).map((_, i) =>
        addDays(currentWeekStart.value, i)
    )
);

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


function prevWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, -7);
}

function nextWeek() {
    currentWeekStart.value = addDays(currentWeekStart.value, 7);
}

function todosForDay(day: Date) {
    // Filter this.todos by matching date strings; assumes each todo has a dueDate field
    return (genericToDoActions.value || []).filter(todo => {
        const todoDate = new Date(todo.dateWithTime);
        return todoDate.toDateString() === day.toDateString();
    });
}

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

function handleCalendarEvent(eventContent: { type: string, newEventsQuantity: number, todayEventsQuantity?: number, isToday?: boolean }) {
    console.log("new calendar event : ", eventContent)
    totalEventsQuantity.value = eventContent.newEventsQuantity
    if (eventContent.isToday) {
        if (eventContent.type == "delete") {
            todayEventsQuantity.value--
        } else {
            todayEventsQuantity.value++
        }

    }

    if (eventContent.todayEventsQuantity) {
        todayEventsQuantity.value = eventContent.todayEventsQuantity
    }
}

async function handleToDoEvent(eventContent: { type: string, newToDoQuantity: number, karmaCoinsChange: undefined | number }) {
    console.log("eventContent:\n", eventContent)
    if (eventContent.karmaCoinsChange !== undefined && userInfo.value) {
        userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange;
    }
    await askToDo()
}

async function handleAddToDo(result: { success: boolean, error: string }) {
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
    gap: 2%;
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

.todo-grid-box {
    height: 40%;
    min-height: 0;
    margin-left: 2%;
    width: 97%;
    margin-bottom: 1%;
    display: flex;
    flex-direction: column;
}

.todo-grid-container {
    width: 100%;
    flex: 1;
    display: grid;
    grid-template-columns: repeat(7, 23%);
    gap: 1rem;
    min-height: 0;
    overflow-x: auto;
}



.custom-select {
    position: relative;
    display: flex;
    align-items: center;
}

.menu-icon {
    font-size: 18px;
    display: inline-flex;
}

.select-icon {
    position: absolute;
    right: 10px;
    pointer-events: none;
}

.grid-todo-header {
    /* di default non è flexibile */
    flex: 0 0 auto;
}

.grid-todo-header button {
    margin-top: 1%;
    margin-left: 1%;
    margin-right: 1%;
}

.day-column {
    margin-left: 1%;
    margin-right: 1%;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.todo-grid-box {
    display: flex;
    flex-direction: column;
}

.todos-wrapper {
    flex: 1 1 auto;
    /* occupa tutto lo spazio sotto la testata */
    overflow-y: auto;
    /* abilita scroll verticale */
    min-height: 0;
    /* importantissimo */
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>