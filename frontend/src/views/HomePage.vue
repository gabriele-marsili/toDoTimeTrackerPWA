<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="home-app">
        <Sidebar :activeSection="'home'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <div class="content-grid">
                <!-- Colonna 1: Today To Do -->
                <div class="box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                    <h3>Today To Do</h3>
                    <ToDoList :trigger-add-to-do="false" :is-sub-list="false" :todos=todayToDoActions
                        @todoEvent=handleToDoEvent viewMode="grid">
                    </ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList :trigger-add-to-do="triggerAddToDo" :is-sub-list="false" @todoEvent=handleToDoEvent
                        :todos=genericToDoActions viewMode="grid">
                    </ToDoList>

                </div>
                <!-- Colonna 3: Info Utente + Time Tracker -->
                <div class="last-box">

                    <div class="sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                        <h3>User Info</h3>
                        <div class="user-info-container">
                            <!-- Colonna sinistra: dettagli utente -->
                            <div class="user-details">
                                <div class="username">{{ userInfo.username }}</div>
                                <div class="info-grid">
                                    <div class="info-left">
                                        <div class="prestige-badge">
                                            <span class="material-symbols-outlined badge-icon">star</span>
                                            <span class="prestige-text">{{
                                                userHandler.getUserPrestigeTitle(todoCompletedQuantity).title }}</span>
                                        </div>
                                        <div class="karma-coins">
                                            <span class="material-symbols-outlined karma-coins-icon">paid</span>
                                            <span>{{ userInfo.karmaCoinsBalance.toString() }} Karma Coins</span>
                                        </div>
                                    </div>
                                    <div class="info-right">
                                        <div class="todo-count">
                                            <span class="material-symbols-outlined todo-icon">task</span>
                                            <span>{{ totalToDoQuantity }} Todos</span>
                                        </div>
                                        <div class="event-count">
                                            <span class="material-symbols-outlined events-count-coins-icon">event</span>
                                            <span>{{ totalEventsQuantity }} Events</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Colonna destra: avatar e friend count -->
                            <div class="avatar-container">
                                <div class="avatar-wrapper" :class="selectedFrameClass">
                                    <img :src="userInfo.avatarImagePath" alt="User Avatar" class="avatar" />
                                </div>
                                <div class="friend-count">
                                    <span class="material-symbols-outlined friend-icon">people</span>
                                    <span>{{ userInfo.friends.length }} Friends</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                        <h3>Time Tracker</h3>
                        <TimeTrackerRuleList :view-mode="'list'"></TimeTrackerRuleList>
                    </div>

                </div>
            </div>

            <div class="footer p-15 rounded-2xl elevated shadow-lg text-center">
                <h3>Calendar</h3>
                <Calendar @calendarEvent=handleCalendarEvent></Calendar>
            </div>

        </div>

    </div>
</template>

<script lang="ts">
import { ref, onMounted, toRaw, computed } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import ToDoList from '../components/ToDoList.vue'
import { ToDoAction, ToDoHandler, ToDoObj, ToDoPriority } from '../engine/toDoEngine';
import Calendar from '../components/Calendar.vue';
import TimeTrackerRuleList from '../components/TimeTrackerRuleList.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import { delay, isToday } from '../utils/generalUtils';
import { useRouter } from 'vue-router';
import { ExtComunicator } from '../comunicator/extComunicator';
import { TimeTrackerHandler, TimeTrackerRule } from '../engine/timeTracker';

export default {
    components: { Sidebar, NotificationManager, ConnectionStatus, ToDoList, Calendar, TimeTrackerRuleList },
    setup() {
        const triggerAddToDo = ref(false)
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const todayToDoActions = ref<ToDoAction[]>([]);
        const genericToDoActions = ref<ToDoAction[]>([]);
        const api_gestor = API_gestor.getInstance()
        const todoHandler = ToDoHandler.getInstance(api_gestor)
        const userHandler = UserHandler.getInstance(api_gestor)
        const defaultImagePath = "../../public/user.avif"
        const todoCompletedQuantity = ref(0);
        const totalToDoQuantity = ref(genericToDoActions.value.length);
        const totalEventsQuantity = ref(0);


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
            fcmToken: "",
            frame: "",
            karmaBoost: 0
        });

        const router = useRouter();
        const notificationManager = ref(null);

        const selectedFrameClass = computed(() => {
            return getFrameClass(userInfo.value.frame);
        });

        const getFrameClass = (frameId: string) => {
            if (frameId == "") {
                return 'no-frame'
            }
            return `frame-${frameId.replace(/_/g, '-')}`;
        };

        const handleSectionChange = (newSection: any) => {
            console.log(`Navigating to section: ${newSection}`);
        };

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
            console.log("userInfoRes (home):\n", userInfoRes)
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

        function handleCalendarEvent(eventContent: { type: string, newEventsQuantity: number }) {
            console.log("new calendar event : ", eventContent)
            totalEventsQuantity.value = eventContent.newEventsQuantity
        }

        async function handleToDoEvent(eventContent: { type: string, newToDoQuantity: number, karmaCoinsChange: undefined | number }) {
            if (eventContent.newToDoQuantity > -1) {
                console.log("new to do event : ", eventContent)
                totalToDoQuantity.value = eventContent.newToDoQuantity
            }

            if (eventContent.type == "todo completed or not completed" && eventContent.karmaCoinsChange) {
                //update karma coins balance
                userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange + (userInfo.value.karmaBoost * eventContent.karmaCoinsChange)
                if (eventContent.karmaCoinsChange > 0) {
                    totalToDoQuantity.value--
                } else {
                    totalToDoQuantity.value++
                }
                const newUinfo = toRaw(userInfo.value)
                await userHandler.updateUserInfo(newUinfo)
                await askUserInfo()
                await askToDo()
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


            setTimeout(() => {
                if (userInfo.value.username != "") {
                    sendNotify("info", userInfo.value.username + " welcome back in TTT App")
                }
            }, 300);


            console.log("userHandler:\n", userHandler)

            await askUserInfo()
            await askToDo()

            const timeTrackerHandler = TimeTrackerHandler.getInstance(api_gestor)
            const extComunicator = ExtComunicator.getInstance(timeTrackerHandler, userInfo.value.licenseKey)

            const rawUserInfo = toRaw(userInfo.value)
            extComunicator.notifyPwaReady(rawUserInfo);



        });

        return {
            handleCalendarEvent,
            handleToDoEvent,
            askToDo,
            askUserInfo,
            userInfo,
            isDarkMode,
            handleSectionChange,
            notificationManager,
            sendNotify,
            todayToDoActions,
            genericToDoActions,
            userHandler,
            todoCompletedQuantity,
            totalToDoQuantity,
            totalEventsQuantity,
            triggerAddToDo,
            selectedFrameClass
        };
    },
};
</script>

<style scoped>
.home-app {
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
    padding: 20px;
    margin-left: 5%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: 'Poppins', sans-serif;
    height: 100%;
}




.content-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    height: 50%;
}


.box {
    background-color: var(--background);
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
    box-sizing: border-box;
    min-height: 69%;
    max-height: 69%;
    display: flex;
    flex-direction: column;
}

.last-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 23px
}

.sub-box {
    background-color: var(--background);
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
    box-sizing: border-box;
    display: flex;
    min-height: 32%;
    max-height: 32.3%;
    flex-direction: column;
    overflow-y: auto;

}

.sub-box::-webkit-scrollbar {
    display: none;
}

.footer {
    margin-top: 5%;
    background-color: var(--background);
    padding: 15px;
    border-radius: 8px;
    color: var(--color);
    height: 35vh;
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
    margin-left: 0%;
}

.footer::-webkit-scrollbar {
    display: none;
}

.user-info-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    background: var(--background, #212121);
    border-radius: 8px;
}

.user-details {
    flex: 1;
    text-align: left;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
}

.info-left {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-right {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
}

.avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.friend-count {
    margin-top: 8px;
    font-size: 0.9em;
    color: var(--color);
    display: flex;
    flex-direction: row;
    justify-content: center;
}


.username {
    font-size: 1.2em;
    font-weight: 600;
}

.prestige-badge,
.karma-coins,
.todo-count,
.event-count {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9em;
    color: var(--color);
}

.badge-icon,
.todo-icon,
.friend-icon,
.karma-coins-icon,
.events-count-coins-icon {
    font-size: 1em;
    margin-right: 4px;
    color: #FFD700;
}

.friend-icon {
    margin-top: 5%;
}
</style>
