<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
    <ConnectionStatus />
    <div class="main-app">
        <Sidebar :activeSection="'shop'" @update:activeSection="handleSectionChange" />
        <NotificationManager ref="notificationManager" />

        <div class="main-content">

            <header class="header-section box elevated shadow-lg rounded-2xl">

                <div class="header-item">
                    <span class="material-symbols-outlined icon">paid</span>
                    <span>Karma Points : </span>
                    <span class="value"> {{ userInfo.karmaCoinsBalance }}</span>
                </div>


                <nav class="flex flex-row gap-5">
                    <button class="baseButton" @click="currentView = 'shop'">Shop
                        <span class="material-symbols-outlined badge-icon">shopping_cart</span>
                    </button>
                    <button class="baseButton" @click="currentView = 'inventory'">Inventory
                        <span class="material-symbols-outlined badge-icon">inventory_2</span>
                    </button>
                    <button class="baseButton" @click="currentView = 'sell'">Sell Items
                        <span class="material-symbols-outlined badge-icon">attach_money</span>
                    </button>
                </nav>

            </header>

            <div class="shop-area">
            <ShopDisplay
                v-if="currentView === 'shop'"
                :userInfo="userInfo"
                @update-karma="askUserInfo"
                @show-notification="sendNotify"
            />

            <InventoryDisplay
                v-if="currentView === 'inventory'"                
                @show-notification="sendNotify"
                @update-user="askUserInfo"
                :userLicenseKey="userInfo.licenseKey"
                :userName="userInfo.username"
                :userInventoryNeedUpdate ="userInvNeedUpdate"
            />

            <SellDisplay
                v-if="currentView === 'sell'"                
                @show-notification="sendNotify"
                :userLicenseKey="userInfo.licenseKey"
                :user-info="userInfo"
                @update-karma="askUserInfo"
                
            />

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
import ShopDisplay from '../components/ShopDisplay.vue';
import InventoryDisplay from '../components/InventoryDisplay.vue';
import SellDisplay from '../components/SellDisplay.vue';

const notificationManager = ref(null);
const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
const api_gestor = API_gestor.getInstance()
const userHandler = UserHandler.getInstance(api_gestor)
const defaultImagePath = "../../public/user.avif"
const userInvNeedUpdate = ref(false)
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
    karmaBoost : 0
});
const currentView = ref('shop'); // 'shop', 'inventory', 'sell'


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
    console.log("userInfoRes (shop page):\n", userInfoRes)
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

.shop-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    overflow-y: auto; /* Enable scrolling for shop content */
}

</style>