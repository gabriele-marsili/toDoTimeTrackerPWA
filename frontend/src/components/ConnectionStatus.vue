<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

    <NotificationManager ref="notificationManager" />
    <BroadcastListener ref="broadcastListener" />

    <transition name="fade">
        <div v-if="showBox" class="connection-box">

            <span v-if="isOnline" class="material-symbols-outlined g-icon">rss_feed</span>
            <span v-if="!isOnline" class="material-symbols-outlined g-icon">wifi_off</span>

            <div class="message">
                {{ isOnline ? "You're back online" : "No internet connection. Searching for connection..." }}
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import NotificationManager from '../gestors/NotificationManager.vue'
import BroadcastListener from './BroadcastListener.vue'

export default {
    components: { NotificationManager, BroadcastListener },
    setup() {
        const isOnline = ref(navigator.onLine)
        const showBox = ref(!navigator.onLine)
        const notificationManager = ref(null)
        const broadcastListener = ref(null);

        function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
            if (notificationManager.value) {
                (notificationManager.value as any).showNotification({
                    type: type,
                    message: text,
                })
            }
        }

        function updateOnlineStatus() {
            isOnline.value = navigator.onLine            
        }

        // Watch for changes to the online status to control the visibility of the box.
        watch(isOnline, (val) => {
            if (val) {
                // Show the box when connection is restored, then hide it after 5 seconds.
                showBox.value = true
                setTimeout(() => {
                    showBox.value = false
                }, 5000)
            } else {
                // Immediately show the box if connection is lost.
                showBox.value = true
            }
        })

        onMounted(() => {
            window.addEventListener('online', updateOnlineStatus)
            window.addEventListener('offline', updateOnlineStatus)
        })

        onUnmounted(() => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
        })

        return {
            broadcastListener,
            isOnline,
            showBox,
            notificationManager,
            updateOnlineStatus,
        }
    }
}
</script>

<style scoped>
.connection-box {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    align-items: center;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 1rem;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-family: "Arial", sans-serif;
    opacity: 0.9;
    transition: all 0.3s ease-in-out;
    z-index: 9999;    
}

.connection-box .g-icon {
    margin-right: 10px;
}
</style>