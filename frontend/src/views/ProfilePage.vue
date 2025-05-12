<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'profile_page'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">


            <div class="profile-page-content">
                <div class="left-column">
                    <div class="profile-info-box box elevated shadow-lg rounded-2xl">
                        <h3>User Profile</h3>
                        <div class="user-info-container">
                            <!-- Colonna sinistra: dettagli utente -->
                            <div class="user-details">
                                <div class="username">{{ userInfo.username }}</div>
                                <div class="info-grid">

                                    <div class="prestige-badge">
                                        <span class="material-symbols-outlined badge-icon">star</span>
                                        <span class="prestige-text">{{
                                            userHandler.getUserPrestigeTitle(todoCompletedQuantity).title }}</span>
                                    </div>

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
                    <div class="inventory-box box elevated shadow-lg rounded-2xl">
                        <InventoryDisplay :userInventoryNeedUpdate="uInventoryNeedUpdate"
                            :userLicenseKey="userInfo.licenseKey" @apply-item="handleApplyItem"
                            @use-item="handleUseItem" @show-notification="sendNotify" @update-user="askUserInfo" />
                    </div>
                </div>

                <div class="right-column">
                    <div class="friends-list-box box elevated shadow-lg rounded-2xl">
                        <FriendList :user_Info="userInfo" @notify="sendNotify" @user_info_update="askUserInfo"
                            @update-inventory="changeUinvNeedUpdate" />
                    </div>
                </div>
            </div>

        </div>

    </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import Sidebar from '../components/Sidebar.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { userDBentry } from '../types/userTypes';
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
import { ShopItem } from '../types/shopTypes';
import { ToDoAction, ToDoHandler, ToDoObj } from '../engine/toDoEngine';
import InventoryDisplay from '../components/InventoryDisplay.vue';
import FriendList from '../components/FriendList.vue';


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
const uInventoryNeedUpdate = ref(false)
const todoHandler = ToDoHandler.getInstance(api_gestor)
const genericToDoActions = ref<ToDoAction[]>([]);
const todoCompletedQuantity = ref(0);
const totalToDoQuantity = ref(genericToDoActions.value.length);
const totalEventsQuantity = ref(0);
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

function changeUinvNeedUpdate() {
    uInventoryNeedUpdate.value = true
    setTimeout(() => uInventoryNeedUpdate.value = false, 1500)
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


            todoCompletedQuantity.value = 0
            for (let to_do of todoList) {
                if (to_do.completed) {
                    todoCompletedQuantity.value++
                }
                const toDoAction = todoHandler.fromToDoObj(to_do)
                console.log("toDoAction:\n", toDoAction)

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


const handleApplyItem = (item: ShopItem) => {
    sendNotify("success", `Applied item: ${item.name}`);
    // Logic to apply the item (e.g., update avatar, etc.)
    if (item.type === 'avatar') {
        userInfo.value.avatarImagePath = item.imageUrl || defaultImagePath;
        // Potentially update this in the backend as well
    }
};

const handleUseItem = (item: ShopItem) => {
    sendNotify("info", `Used item: ${item.name}`);
    // Logic to use the item (e.g., consume, activate effect)
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
    await askToDo()

});
</script>


<style scoped>
.main-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 20px;
    gap: 20px;
    /* Space between header and content */
}

.profile-page-content {
    display: flex;
    gap: 20px;
    /* Space between columns */
    flex-grow: 1;
    /* Allows content area to grow */
    min-height: 0;
    margin-left: 2%;
    /* Required for flex-grow to work correctly with scrolling children */
}

.left-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* Space between the two left boxes */
    flex: 1;
    /* Takes up 1 part of the available space */
    min-width: 550px;
    /* Minimum width for the left column */
    max-width: 50%;
    /* Max width for the left column */
    min-height: 50%;
    max-height: 98.5%;
}

.right-column {
    flex: 2;
    /* Takes up 2 parts of the available space (larger) */
    min-width: 52%;
    max-width: 52%;
    min-height: 50%;
    max-height: 98%;

}

.profile-info-box {
    flex-grow: 1;
    /* Shares space equally with inventory-box */
    max-height: 35%;
    /* Allows it to be slightly shorter than inventory-box, if space permits */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    min-height: 150px;
    /* Ensure a minimum height */
}

.profile-info-box h3 {
    color: var(--accent-color);
    margin-bottom: 15px;
    font-size: 1.3em;
}

.inventory-box {
    flex-grow: 1;
    /* Allows inventory box to fill remaining space, now sharing equally */
    max-height: 61%;
    /* Allows it to be slightly taller than profile-info-box, if space permits */
    overflow-y: auto;
    /* Enable scrolling for inventory */
    padding: 0;
    /* Remove padding from the box itself, let InventoryDisplay handle it */
    display: flex;
    flex-direction: column;
    min-height: 200px;
    /* Ensure a minimum height */
}

.friends-list-box {
    flex-grow: 1;
    /* Allows friends list box to fill available space */
    overflow-y: auto;
    /* Enable scrolling for friends list */
    padding: 20px;
    /* Padding for the friends list box */
    min-height: 100%;
}

/* Base styles for boxes, elevated, shadow-lg are already defined in style.css */
/* Ensure .box background color is applied. For this component, it's defined in style.css */
.box {
    background-color: var(--background-dark);
    color: var(--color);
    /* Inherit text color from theme */
}


.user-info-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--background-dark, #212121);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    min-width: 100%;
    min-height: 85%;
}

.user-details {
    flex: 1;
    text-align: left;
}



.info-grid {
    display: flex;
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
}


.avatar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40%;
    min-height: 100%;
}

/* Se non sono già presenti, puoi mantenere o aggiornare i seguenti stili per avatar-wrapper e avatar */
.avatar-wrapper {
    /* Assicurati che l'avatar sia in un cerchio con cornice personalizzabile */
    width: 70px;
    height: 70px;
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

.event-count,
.todo-count,
.prestige-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.9em;
    color: #fff;
}

.friend-count {
    margin-top: 8px;
    font-size: 0.9em;
    color: #aaa;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
    .profile-page-content {
        flex-direction: column;
        /* Stack columns on smaller screens */
    }

    .left-column,
    .right-column {
        max-width: 100%;
        /* Full width for both columns */
        min-width: unset;
        /* Remove min-width constraints */
    }

    .inventory-box {
        height: 500px;
        /* Give a fixed height to inventory on smaller screens */
    }
}
</style>