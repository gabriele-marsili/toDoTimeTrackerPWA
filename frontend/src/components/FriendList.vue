<template>
    <header class="header-section box elevated shadow-lg rounded-2xl">
        <div class="header-buttons">
            <button class="baseButton" @click="addFriendBoxOpened = true">
                <span class="material-symbols-outlined icon">person_add</span>
                Add Friend
            </button>
            <button class="baseButton" @click="sendGiftNotification">
                <span class="material-symbols-outlined icon">card_giftcard</span>
                Send Gift
            </button>
        </div>

    </header>

    <div class="friends-list">
        <h2>My Friends</h2>
        <div v-if="friends.length === 0" class="empty-friends-message">
            <p>You don't have any friends yet. Add some!</p>
        </div>
        <div v-else class="friends-column custom-scrollbar">
            <div v-for="friend in friends" :key="friend.licenseKey"
                class="friend-card box elevated shadow-md rounded-lg">

                <div class="friend-info">
                    <img :src="friend.avatarImagePath || defaultFriendAvatar" alt="Friend Avatar" class="friend-avatar">
                    <p class="friend-name">{{ friend.username }}</p>
                </div>


                <button class="baseButton remove-button" @click="removeFriend(friend.licenseKey)">
                    <span class="material-symbols-outlined icon">person_remove</span>
                    Remove
                </button>
            </div>
        </div>

        <h2 class="requests-heading">Friend Requests</h2>
        <div v-if="incomingFriendRequests.length === 0" class="empty-requests-message">
            <p>No new friend requests.</p>
        </div>
        <div v-else class="requests-column custom-scrollbar">
            <div v-for="request in incomingFriendRequests" :key="request.by_licenseKey"
                class="request-card box elevated shadow-md rounded-lg">

                <div class="request-info">
                    <p class="request-name">{{ request.by_username || 'Unknown User' }} wants to be your friend</p>
                </div>
                <div class="request-actions">
                    <button class="baseButton accept-button" @click="acceptFriendRequest(request)">
                        <span class="material-symbols-outlined icon">person_add</span>
                        Accept
                    </button>
                    <button class="baseButton reject-button" @click="rejectFriendRequest(request)">
                        <span class="material-symbols-outlined icon">person_off</span>
                        Reject
                    </button>
                </div>
            </div>
        </div>

    </div>

    <div v-if="addFriendBoxOpened" class="modal">
        <div class="content">
            <h4>Add A New Friend:</h4>
            <div class="form-group">
                <label for="friend_username">Friend's Username:</label>
                <input id="friend_username" class="baseInputField" type="text" v-model="friendToAddUsername"
                    placeholder="Friend's Username" />
            </div>

            <div class="button-actions">

                <button class="baseButton" @click="addNewFriend">
                    {{ friendToAddUsername == "" ? "Add New Friend" : `Add ${friendToAddUsername} as friend` }}
                    <span class="material-symbols-outlined g-icon">person_add</span>
                </button>
                <button class="baseButton" @click="addFriendBoxOpened = false">
                    Cancel
                    <span class="material-symbols-outlined g-icon">cancel</span>
                </button>
            </div>
        </div>
    </div>

    <div v-if="sendGiftToFriendBoxOpened" class="modal">
        <div class="content">
            <h4>Send Gift To Friend:</h4>
            <div class="form-group">
                <label for="friend_username">Friend to send the gift to:</label>
                <select v-model.string="friendToSendGiftLK" class="selettore">
                    <option v-for="friend in friends" :key="friend.licenseKey" :value="friend.licenseKey">
                        {{ friend.username }}
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label for="friend_username">Gift to send:</label>
                <select v-model="giftToSend" class="selettore">
                    <option v-for="item in avaibleGiftItems" :key="item.item.id" :value="item.item">
                        {{ item.item.name }} ({{ item.quantity }})
                    </option>
                </select>
            </div>

            <div class="button-actions">

                <button class="baseButton" @click="sendGift">
                    Send Gift
                    <span class="material-symbols-outlined g-icon">featured_seasonal_and_gifts</span>
                </button>
                <button class="baseButton" @click="resetSendGiftValue">
                    Cancel
                    <span class="material-symbols-outlined g-icon">cancel</span>
                </button>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue';
import { friendRequest, userDBentry } from '../types/userTypes';
import { API_gestor } from '../backend-comunication/api_comunication';
import { GiftItem, UserInventory } from '../types/shopTypes';
import { AnyObject } from 'chart.js/dist/types/basic';

const props = defineProps<{
    user_Info: userDBentry;
}>();

const addFriendBoxOpened = ref(false);
const sendGiftToFriendBoxOpened = ref(false);
const friends = ref<userDBentry[]>([]);
const friendToAddUsername = ref("")
const friendToSendGiftLK = ref("")
const incomingFriendRequests = ref<friendRequest[]>([]);
const userInventory = ref<UserInventory | null>(null); // Allow null for initial loading state
const avaibleGiftItems = ref<{ item: GiftItem, quantity: number }[]>([]); // Allow null for initial loading state
const defaultFriendAvatar = "../../public/user.avif"; // Default avatar for friends
const api_gestor = API_gestor.getInstance();
const emit = defineEmits(["notify", "user_info_update","update-inventory"])
function notifyWithEmit(type: "info" | "warning" | "error" | "success", text: string) {
    emit("notify", type, text);
}
const giftToSend = ref<null | GiftItem>(null)

// Function to fetch and update local user inventory
async function updateLocalUserInventory() {
    userInventory.value = null; // Reset inventory while loading

    if (props.user_Info.licenseKey === "") {
        console.warn("License key is empty, cannot fetch inventory.");
        return;
    }

    try {
        const userInventoryRes = await api_gestor.getUserInventory(props.user_Info.licenseKey);
        if (userInventoryRes.success) {
            userInventory.value = userInventoryRes.userInventory;
            console.log("User inventory loaded:", userInventory.value);
        } else {
            if (userInventoryRes.errorMessage.includes('No user inventory found')) {
                // If no inventory found, it means this is a new user or an issue.
                // Let's create a default empty inventory for the user if it doesn't exist.
                const newInventory: UserInventory = { licenseKey: props.user_Info.licenseKey, items: [] };
                const r = await api_gestor.updateUserInventory(newInventory);
                if (r.success) {
                    userInventory.value = newInventory; // Update local state as well
                    console.log("User inventory created:", userInventory.value);
                } else {
                    emit("notify", "error", r.errorMessage);
                }
            } else {
                let err = `Failed to load user inventory: ${userInventoryRes.errorMessage}`;
                emit("notify", "error", err);
                console.error(err);
            }
        }
    } catch (error: any) {
        let e = `An unexpected error occurred while fetching inventory: ${error.message}`;
        emit("notify", "error", e);
        console.error(e);
    }
}

const addNewFriend = async () => {
    try {
        if (friendToAddUsername.value == "") {
            throw new Error("Please insert the username of the friend that you want to add");
        }

        if (friendToAddUsername.value === props.user_Info.username) {
            throw new Error("You can't add yourself as a friend");
        }

        const addRes = await api_gestor.sendFriendRequest(friendToAddUsername.value, props.user_Info.username, props.user_Info.licenseKey)
        if (!addRes.success) {
            throw new Error(addRes.errorMessage)
        }

        emit("notify", "success", "Friend request sent to " + friendToAddUsername.value)

    } catch (error: any) {
        emit("notify", "error", error.message)
    } finally {
        addFriendBoxOpened.value = false;
        friendToAddUsername.value = ""
    }
};

function resetSendGiftValue() {
    friendToSendGiftLK.value = ""
    giftToSend.value = null;
    sendGiftToFriendBoxOpened.value = false;
}

const sendGiftNotification = async () => {
    if (friends.value.length == 0) {
        emit("notify", "warning", "Add at least one friend to send gift");
        return;
    }
    await updateLocalUserInventory()
    if (!userInventory.value) {
        emit("notify", "warning", "User inventory not loaded");
        return;
    }

    avaibleGiftItems.value = userInventory.value.items
        .filter(el => el.item.type === "gift" && el.quantity > 0)
        .map(el => {
            const giftItem: GiftItem = el.item as GiftItem;
            if (!giftItem.originalItemId) giftItem.originalItemId = el.item.id
            return { item: giftItem, quantity: el.quantity };
        });

    if (avaibleGiftItems.value.length == 0) {
        emit("notify", "warning", "You don't have any gift to send");
        return;
    }
    sendGiftToFriendBoxOpened.value = true;
};

async function sendGift() {
    try {
        if (!giftToSend.value) throw new Error("No gift selected")
        if (friendToSendGiftLK.value == "") throw new Error("Invalid user to send the gift to")
        const rawGift = toRaw(giftToSend.value)
        
        const sendRes = await api_gestor.sendGiftToFriend(rawGift, friendToSendGiftLK.value, props.user_Info)
        if (!sendRes.success) throw new Error(sendRes.errorMessage)
        emit("notify", "success", `Gift ${giftToSend.value.name} sent successfully`)
        emit("update-inventory")
    } catch (error: any) {
        emit("notify", "error", error.message)
    } finally {
        resetSendGiftValue()
    }
}

async function loadFriends() {
    try {
        if (!props.user_Info || !props.user_Info.friends || props.user_Info.friends.length === 0) {
            friends.value = []; // Nessun amico, resetta la lista
            // Non è necessariamente un errore, ma un messaggio informativo.
            console.log("You don't have any friends yet (or user_Info is not fully loaded).");
            return;
        }


        let rawLks = props.user_Info.friends.map(element => element.licenseKey)
        const loadFriendsRes = await api_gestor.loadFriends(rawLks)
        if (!loadFriendsRes.success) throw new Error(loadFriendsRes.errorMessage);
        friends.value = loadFriendsRes.friends;
        console.log("Load friends new value:\n", friends.value)
    } catch (error: any) {
        console.log("error in load friends:\n", error);
        if (error.message != "You don't have any friends yet") {
            notifyWithEmit("error", "Error while loading friend list")
        }
    }
}

const removeFriend = async (friendLicenseKey: string) => {
    try {
        // Chiamata API per rimuovere l'amicizia
        const removeRes = await api_gestor.removeFriend(props.user_Info, friendLicenseKey);

        if (!removeRes.success) {
            throw new Error(removeRes.errorMessage);
        }

        // Aggiorna la lista amici localmente (tramite componente padre che aggiorna user info)
        emit("user_info_update")
        await loadFriends()
        notifyWithEmit("success", `Friend removed successfully!`);
    } catch (error: any) {
        console.error("Error removing friend:", error);
        notifyWithEmit("error", `Error removing friend: ${error.message}`);
    }
};



// --- Logica per le richieste di Amicizia ---

async function loadIncomingFriendRequests() {
    try {
        // Assumi che api_gestor.loadFriendRequests prenda la licenseKey dell'utente corrente
        const loadRequestsRes = await api_gestor.loadFriendRequests(props.user_Info.licenseKey);

        if (!loadRequestsRes.success) {
            // Se non ci sono richieste, non è un errore critico, ma una condizione.
            if (loadRequestsRes.errorMessage === "No friend request") { // Assumendo questo messaggio
                incomingFriendRequests.value = [];
                console.log("No new friend requests found.");
            } else {
                throw new Error(loadRequestsRes.errorMessage);
            }
        } else {
            incomingFriendRequests.value = loadRequestsRes.friendRequests;
            console.log("Incoming friend requests:\n", incomingFriendRequests.value);
        }
    } catch (error: any) {
        console.error("Error loading incoming friend requests:", error);
        notifyWithEmit("error", `Error loading friend requests: ${error.message}`);
    }
}

const acceptFriendRequest = async (request: friendRequest) => {
    try {
        const acceptRes = await api_gestor.acceptFriendRequest(request, props.user_Info);
        if (!acceptRes.success) {
            throw new Error(acceptRes.errorMessage);
        }

        // Rimuovi la richiesta dalla lista
        incomingFriendRequests.value = incomingFriendRequests.value.filter(req => req.by_licenseKey !== request.by_licenseKey);

        // Aggiorna la lista amici localmente (tramite componente padre che aggiorna user info)
        emit("user_info_update")
        await loadFriends()
        notifyWithEmit("success", `Accepted friend request from ${request.by_username}!`);
    } catch (error: any) {
        console.error("Error accepting friend request:", error);
        notifyWithEmit("error", `Error accepting request: ${error.message}`);
    }
};

const rejectFriendRequest = async (request: friendRequest) => {
    try {
        const rejectRes = await api_gestor.rejectFriendRequest(request, props.user_Info.licenseKey, props.user_Info.username);
        if (!rejectRes.success) {
            throw new Error(rejectRes.errorMessage);
        }

        // Rimuovi la richiesta dalla lista
        incomingFriendRequests.value = incomingFriendRequests.value.filter(req => req.by_licenseKey !== request.by_licenseKey);
        emit("user_info_update")
        notifyWithEmit("info", `Rejected friend request from ${request.by_username}.`);
    } catch (error: any) {
        console.error("Error rejecting friend request:", error);
        notifyWithEmit("error", `Error rejecting request: ${error.message}`);
    }
};


onMounted(async () => {
    await loadFriends();
    await loadIncomingFriendRequests();
    await updateLocalUserInventory()
})


// Watch user_Info changes if it can be updated dynamically from parent
watch(() => props.user_Info, async (newVal, oldVal) => {
    if (newVal && newVal.licenseKey !== oldVal?.licenseKey) {
        console.log("user_Info changed, reloading friends and requests...");
        await loadFriends();
        await loadIncomingFriendRequests();
        await updateLocalUserInventory()
    }
}, { deep: true }); // Deep watch for changes within the user_Info object
</script>


<style scoped>
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
    gap: 45px;
    /* Space between buttons */
}

.header-buttons .baseButton {
    padding: 8px 15px;
    font-size: 0.95em;
}


.friends-list {
    padding: 20px;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
}

.friends-list h2,
.requests-heading {
    margin-bottom: 20px;
    color: var(--accent-color);
    text-align: center;
    width: 100%;
}

.requests-heading {
    margin-top: 40px;
    /* Spazio tra le sezioni */
}

.empty-friends-message,
.empty-requests-message {
    text-align: center;
    margin-top: 20px;
    font-size: 1.1em;
    color: var(--text-color);
}

.friends-column {
    display: flex;
    justify-content: start;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px;
    align-items: center;
}

.requests-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: start;
    gap: 20px;
    width: 100%;
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 10px;

}

.friends-column {
    margin-bottom: 20px;
    /* Spazio prima della sezione richieste */
}

.friend-card,
.request-card {
    background-color: var(--background-dark);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: var(--shadow);
    position: relative;
    padding-bottom: 60px;
    min-height: 40%;
    /* Spazio per i bottoni */
}

.friend-card {
    min-height: 60%;

}

.friend-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--accent-color);
    margin-bottom: 10px;
}

.friend-info,
.request-info {
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 15px;
    gap: 10px;
    align-items: center;
}

.friend-name,
.request-name {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--color);
    margin-bottom: 5px;
}

/* Bottoni Amici */
.remove-button {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    font-size: 0.9em;
    padding: 8px 12px;

    border-color: #dc3545;
    color: white;
}

.remove-button:hover {
    background-color: #fb041c41;
    border-color: #bd2130;
}

/* Bottoni Richieste di Amicizia */
.request-actions {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    display: flex;
    gap: 5px;
    /* Spazio tra i bottoni */
}

.accept-button,
.reject-button {
    flex: 1;
    font-size: 0.85em;
    padding: 8px 5px;
    /* Adattato per 2 bottoni */
}

.reject-button {
    border: 2px solid #9e9e9e;
}

.reject-button:hover {
    background-color: #ac98983b;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--accent-color);
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color-dark);
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


/*edit to do box */
.content {
    background: #212121;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    min-height: 200px;
    max-height: 500px;
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
</style>