<template>
    <div class="friends-list">
        <h2>My Friends</h2>
        <div v-if="friends.length === 0" class="empty-friends-message">
            <p>You don't have any friends yet. Add some!</p>
        </div>
        <div v-else class="friends-grid custom-scrollbar">
            <div v-for="friend in friends" :key="friend.id" class="friend-card box elevated shadow-md rounded-lg">
                <img :src="friend.avatarImagePath || defaultFriendAvatar" alt="Friend Avatar" class="friend-avatar">
                <div class="friend-info">
                    <p class="friend-name">{{ friend.username }}</p>
                    <p class="friend-prestige">Prestige: {{ friend.prestige }}</p>
                </div>
                <button class="baseButton remove-button" @click="emitRemoveFriend(friend.id)">
                    <span class="material-symbols-outlined icon">person_remove</span>
                    Remove
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

// Define a simple type for friend for this component's purpose
interface Friend {
    id: string;
    username: string;
    prestige: number; // Prestige based on completed todos
    avatarImagePath: string;
}

const props = defineProps<{
    friends: Friend[];
}>();

const emit = defineEmits(['remove-friend']);

const defaultFriendAvatar = "../../public/user.avif"; // Default avatar for friends

const emitRemoveFriend = (friendId: string) => {
    emit('remove-friend', friendId);
};
</script>

<style scoped>
.friends-list {
    padding: 20px;
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
}

.friends-list h2 {
    margin-bottom: 20px;
    color: var(--accent-color);
}

.empty-friends-message {
    text-align: center;
    margin-top: 50px;
    font-size: 1.1em;
    color: var(--text-color);
}

.friends-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    /* Responsive grid for friends */
    gap: 20px;
    width: 100%;
    flex-grow: 1;
    /* Allow grid to take up available vertical space */
    overflow-y: auto;
    /* Enable scrolling for friends list */
    padding-right: 10px;
    /* Space for scrollbar */
}

.friend-card {
    background-color: var(--background-dark);
    border: 2px solid rgba(255, 255, 255, 0.1);
    /* Subtle border */
    border-radius: 8px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: var(--shadow);
    position: relative;
    padding-bottom: 60px;
    /* Space for the button */
}

.friend-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--accent-color);
    margin-bottom: 10px;
}

.friend-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 15px;
}

.friend-name {
    font-size: 1.1em;
    font-weight: bold;
    color: var(--color);
    margin-bottom: 5px;
}

.friend-prestige {
    font-size: 0.9em;
    color: var(--text-color);
}

.remove-button {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    font-size: 0.9em;
    padding: 8px 12px;
    background-color: #dc3545;
    /* Red color for remove button */
    border-color: #dc3545;
    color: white;
}

.remove-button:hover {
    background-color: #c82333;
    /* Darker red on hover */
    border-color: #bd2130;
}

/* Custom Scrollbar (matching InventoryDisplay.vue) */
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
</style>
