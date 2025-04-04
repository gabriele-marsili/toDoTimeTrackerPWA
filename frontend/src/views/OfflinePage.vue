<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

    <NotificationManager ref="notificationManager" />
    <BackgroundEffect>
        <div :class="themeClass" class="flex flex-col items-center justify-center min-h-screen p-6">
            <div class="max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center">
                <div class="flex flex-col items-center gap-4 mb-6">
                    <img src="../assets/logos/mainLogo.png" alt="Logo" class="w-24 h-24 rounded-full">

                    <div class="flex flex-row items-center gap-4">
                        <h1 class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-black'">
                            Ops...You look offline!
                        </h1>
                        <span class="material-symbols-outlined g-icon ">wifi_off</span>
                    </div>

                </div>
                <p class="mb-4" :class="isDarkMode ? 'text-white' : 'text-black'">
                    It looks like you are not connected to the Internet.
                </p>
                <p class="mb-4" :class="isDarkMode ? 'text-white' : 'text-black'">
                    To use all the features of the TTT app, an active connection is required.
                </p>
                <p :class="isDarkMode ? 'text-white' : 'text-black'" class="mb-6">
                    Reconnect for the full experience or explore available offline features.
                </p>
                <!-- Illustrazione offline -->
                <div class="mt-6 flex justify-center">
                    <button @click="tryToReconnect" class="baseButton">
                        <span v-if="isDarkMode" class="text-white">Try To Reconnect</span>
                        <span v-else class="text-black">Try To Reconnect</span>
                        <span class="material-symbols-outlined g-icon ">wifi</span>
                    </button>
                </div>
                <div class="mt-6 flex justify-center">
                    <DarkModeSwitcher @changeDarkMode="handleChangeDarkMode" />
                </div>
            </div>
        </div>
    </BackgroundEffect>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
import NotificationManager from '../gestors/NotificationManager.vue'
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';

export default {
    components: { DarkModeSwitcher, BackgroundEffect, NotificationManager },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const notificationManager = ref(null);
        const router = useRouter();

        function sendNotify(type: "info" | "warning" | "error" | "success", text: string) {
            if (notificationManager.value) {
                (notificationManager.value as any).showNotification({
                    type: type,
                    message: text,
                })
            }else{
                console.log("notification manager not found")
            }
        }

        function handleChangeDarkMode(args: any) { //update dark mode by emit of dark mode switcher component
            isDarkMode.value = args.isDarkMode;
        }

        async function tryToReconnect() {
            if (navigator.onLine) {
                await backOnline()
            } else {
                sendNotify("error", "Sadly you're still offline")
            }
        }

        async function backOnline() {
            sendNotify("success", "You're back online, loading welcome page...")
            await delay(1400)
            
            router.push("/welcome");
        }

        onMounted(() => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            } else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }

            //add listener to catch when the user will came back online:
            window.addEventListener('online', backOnline)
        });

        // Computed per gestire la classe del tema se necessario
        const themeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'));

        return {
            router,
            isDarkMode,
            sendNotify,
            themeClass,
            handleChangeDarkMode,
            backOnline,
            tryToReconnect,
            notificationManager
        };
    },
};
</script>

<style scoped></style>