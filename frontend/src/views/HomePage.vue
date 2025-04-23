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
                    <ToDoList :trigger-add-to-do="false" :is-sub-list="false" :todos=todayToDoActions @todoEvent=handleToDoEvent viewMode="grid">
                    </ToDoList>
                </div>
                <!-- Colonna 2: Generic To Do -->
                <div class="box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                    <h3>Generic To Do</h3>
                    <ToDoList :trigger-add-to-do="triggerAddToDo" :is-sub-list="false" @todoEvent=handleToDoEvent :todos=genericToDoActions viewMode="grid">
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
                                <div class="avatar-wrapper">
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
                        <TimeTrackerRuleList></TimeTrackerRuleList>
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
import { ref, onMounted, toRaw } from 'vue';
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
            fcmToken : ""
        });

        const router = useRouter();
        const notificationManager = ref(null); // Riferimento per NotificationManager

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
                userInfo.value.karmaCoinsBalance += eventContent.karmaCoinsChange
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



            // Mostra una notifica di benvenuto dopo il montaggio
            setTimeout(() => {
                if (userInfo.value.username != "") {
                    sendNotify("info", userInfo.value.username + " welcome back in TTT App")
                }
            }, 300);


            console.log("userHandler:\n", userHandler)

            await askUserInfo()
            await askToDo()
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
            triggerAddToDo
        };
    },
};
</script>

<style scoped>
/*
Verde dettagli : #10B981
grigio : #1e1e1e

*/

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

.custom-select {
    position: relative;
    display: flex;
    align-items: center;
}

.user-menu {
    display: flex;
    align-items: center;
}

.user-menu img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
}


.bottone {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    /* Spazio tra l'icona e il testo */
    color: white;
    background: #ffffff00;
    border: 2px solid #15b680d4;
    height: 36px;
    /* Altezza standard per allineamento */
    padding: 0 15px;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.bottone:hover {
    background-color: #15b68020;
    border-color: #10b981;
}


.selettore {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background: #ffffff00;
    border: 2px solid #15b680d4;
    color: white;
    height: 36px;
    /* Altezza standard per allineamento */
    padding: 0 30px 0 10px;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    outline: none;
}

.selettore:hover {
    background-color: #15b68020;
    border-color: #10b981;
}

.select-icon {
    position: absolute;
    right: 10px;
    pointer-events: none;
    color: #15b680;
}

.menu-icon {
    font-size: 18px;
    display: inline-flex;
}


.text-default {
    color: #ffffff;
    /* Testo standard grigio scuro */
}

.text-green {
    color: #22c55e;
    /* Verde vivace */
}

.text-red {
    color: #ef4444;
    /* Rosso vivace */
}

.reset_button,
.apply_button,
.cancel_button {
    height: 30px;
    width: 90px;
    display: flex;
    gap: 0.3rem;
    color: white;
    background: #ffffff00;
    padding: 0px 15px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    text-align: center;
    align-items: center;
    font-size: 0.9rem;
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

.reset_button {
    border: 2px solid #f44336;
}

.reset_button:hover {
    background-color: #b6301550;
}

.apply_button {
    border: 2px solid #15b680d4;
}

.apply_button:hover {
    background-color: #15b68044;
}

.cancel_button {
    border: 2px solid #9e9e9e;
}

.cancel_button:hover {
    background-color: #ac98983b;
}


/* Griglia con 3 colonne per i box */
.content-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    height: 50%;
}


/* Stile base per i box */
.box {
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    height: 80%;
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
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    box-sizing: border-box;
    display: flex;
    height: 37.3%;
    flex-direction: column;
    overflow-y: auto;
    max-height: 300px;
}

.sub-box::-webkit-scrollbar {
    display: none;
}

/* Footer (Calendario/Eventi): occupa quasi tutta la larghezza del main content */
.footer {
    margin-top: 10px;
    background-color: var(--background-dark);
    padding: 15px;
    border-radius: 8px;
    color: #ffffff;
    height: 35vh;
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
}

.footer::-webkit-scrollbar {
    display: none;
}

.user-info-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    background: var(--background-dark, #212121);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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

/* Colonna destra: impila verticalmente i due elementi e li allinea a destra */
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
    color: #aaa;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

/* Se non sono già presenti, puoi mantenere o aggiornare i seguenti stili per avatar-wrapper e avatar */
.avatar-wrapper {
    /* Assicurati che l'avatar sia in un cerchio con cornice personalizzabile */
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 3px solid var(--avatar-border-color, #10B981);
    overflow: hidden;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.info-details {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
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
    color: #fff;
}

.badge-icon,
.todo-icon,
.friend-icon,
.karma-coins-icon,
.events-count-coins-icon {
    font-size: 1em;
    margin-right: 4px;
    color: #FFD700;
    /* colore oro per il badge, personalizzabile */
}

.friend-icon {
    margin-top: 5%;
}
</style>
