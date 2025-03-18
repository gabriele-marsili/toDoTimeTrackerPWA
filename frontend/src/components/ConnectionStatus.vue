<template>
    <div class="connection-status" :class="{ offline: !isOnline }">
        <div v-if="isOnline">Online</div>
        <div v-else>Offline - Modalità cache attiva</div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

function updateOnlineStatus() {
    isOnline.value = navigator.onLine
}

onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.connection-status {
    padding: 5px;
    background-color: #4caf50;
    color: white;
    text-align: center;
}

.connection-status.offline {
    background-color: #f44336;
}
</style>