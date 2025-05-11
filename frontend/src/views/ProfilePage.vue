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

                <div class="header-buttons">
                    <button class="baseButton" @click="addNewFriend">
                        <span class="material-symbols-outlined icon">person_add</span>
                        Add Friend
                    </button>
                    <button class="baseButton" @click="sendGiftNotification">
                        <span class="material-symbols-outlined icon">card_giftcard</span>
                        Send Gift / Notify
                    </button>
                </div>

            </header>

            <div class="profile-page-content">
                <div class="left-column">
                    <div class="profile-info-box box elevated shadow-lg rounded-2xl">
                        <h3>User Profile</h3>
                        <div class="avatar-section">
                            <img :src="userInfo.avatarImagePath || defaultImagePath" alt="User Avatar"
                                class="user-avatar">
                            <div class="user-details">
                                <p class="username">{{ userInfo.username }}</p>
                                <div class="badges">
                                    <span class="badge">Pro User</span>
                                    <span class="badge">Achiever</span>
                                </div>
                                <p class="prestige">Prestige: {{ calculatePrestige() }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="inventory-box box elevated shadow-lg rounded-2xl">
                        <InventoryDisplay :userLicenseKey="userInfo.licenseKey" @apply-item="handleApplyItem"
                            @use-item="handleUseItem" @show-notification="sendNotify" />
                    </div>
                </div>
                <div class="right-column">
                    <div class="friends-list-box box elevated shadow-lg rounded-2xl">
                        <FriendList :friends="userInfo.friends" @remove-friend="handleRemoveFriend" />
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


const calculatePrestige = () => {
    // Example: Prestige based on Karma Points (or completed todos if you fetch that data)
    return userInfo.value.karmaCoinsBalance * 10; // Simple calculation
};

const addNewFriend = () => {
    sendNotify("info", "Add new friend functionality not yet implemented.");
    // Implement logic to add a new friend (e.g., open a modal, navigate to a page)
};

const sendGiftNotification = () => {
    sendNotify("info", "Send gift/notification functionality not yet implemented.");
    // Implement logic to send a gift or notification to a friend
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

const handleRemoveFriend = (friendId: any) => {
    // Implement logic to remove friend from userInfo.value.friends
    //userInfo.value.friends = userInfo.value.friends.filter(friend => friend.id !== friendId);
    sendNotify("success", `Friend with ID ${friendId} removed.`);
    // Also update this in the backend
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
.main-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 20px;
    gap: 20px;
    /* Space between header and content */
}

.profile-header-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    /* Distribute items along the main axis */
    align-items: center;
    padding: 15px 30px;
    /* Adjust padding for a better look */
    margin-bottom: 20px;
    /* Space below header */
    width: 100%;
    /* Full width for the header */
    box-sizing: border-box;
    /* Include padding in the width calculation */
}

.profile-header-section .header-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1em;
    color: var(--text-color);
}

.header-buttons {
    display: flex;
    gap: 15px;
    /* Space between buttons */
}

.header-buttons .baseButton {
    padding: 8px 15px;
    font-size: 0.95em;
}

.profile-page-content {
    display: flex;
    gap: 20px;
    /* Space between columns */
    flex-grow: 1;
    /* Allows content area to grow */
    min-height: 0;
    /* Required for flex-grow to work correctly with scrolling children */
}

.left-column {
    display: flex;
    flex-direction: column;
    gap: 20px;
    /* Space between the two left boxes */
    flex: 1;
    /* Takes up 1 part of the available space */
    min-width: 300px;
    /* Minimum width for the left column */
    max-width: 35%;
    /* Max width for the left column */
}

.right-column {
    flex: 2;
    /* Takes up 2 parts of the available space (larger) */
    min-width: 600px;
    /* Minimum width for the right column */
}

.profile-info-box {
    flex-grow: 1;
    /* Shares space equally with inventory-box */
    max-height: 48%;
    /* Allows it to be slightly shorter than inventory-box, if space permits */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    min-height: 200px;
    /* Ensure a minimum height */
}

.profile-info-box h3 {
    color: var(--accent-color);
    margin-bottom: 15px;
    font-size: 1.3em;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--accent-color);
    box-shadow: var(--shadow);
}

.user-details {
    margin-top: 10px;
}

.username {
    font-size: 1.2em;
    font-weight: bold;
    color: var(--color);
    margin-bottom: 5px;
}

.badges {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
    /* Allow badges to wrap */
    justify-content: center;
}

.badge {
    background-color: var(--accent-color);
    color: white;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 0.8em;
    font-weight: 600;
}

.prestige {
    font-size: 1em;
    color: var(--text-color);
}


.inventory-box {
    flex-grow: 1;
    /* Allows inventory box to fill remaining space, now sharing equally */
    max-height: 52%;
    /* Allows it to be slightly taller than profile-info-box, if space permits */
    overflow-y: auto;
    /* Enable scrolling for inventory */
    padding: 0;
    /* Remove padding from the box itself, let InventoryDisplay handle it */
    display: flex;
    flex-direction: column;
    min-height: 300px;
    /* Ensure a minimum height */
}

.friends-list-box {
    flex-grow: 1;
    /* Allows friends list box to fill available space */
    overflow-y: auto;
    /* Enable scrolling for friends list */
    padding: 20px;
    /* Padding for the friends list box */
}

/* Base styles for boxes, elevated, shadow-lg are already defined in style.css */
/* Ensure .box background color is applied. For this component, it's defined in style.css */
.box {
    background-color: var(--background-dark);
    color: var(--color);
    /* Inherit text color from theme */
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

@media (max-width: 768px) {
    .profile-header-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .header-buttons {
        width: 100%;
        justify-content: center;
    }
}
</style>