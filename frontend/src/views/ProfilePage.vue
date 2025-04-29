<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'profile_page'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <header class="header-section box elevated shadow-lg rounded-2xl">

                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>
                </div>
                

            </header>
           
        </div>

    </div>

</template>

<script setup lang="ts">
import { startOfWeek, addDays, endOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { computed, onMounted, ref, toRaw } from 'vue';
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
import { parseISO } from 'date-fns';
import { isSameDay } from 'date-fns';
import DatePicker from '../components/DatePicker.vue';


const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor)
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


onMounted(async () => {
    if (isDarkMode.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }

    await askUserInfo()
 
});
</script>

<style scoped>
.main-app {
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
    flex-direction: column;
    align-items: center;
    margin-top: 2%;
    width: 97%;
    background-color: var(--background-dark);
    color: var(--text-color);
    flex-wrap: wrap;
    gap: 0.5%;
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
    font-size: 1.4em;
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

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>