<template>
    <BackgroundEffect>
        <ConnectionStatus />
        <NotificationManager ref="notificationManager" />
        <div :class="isDarkMode ? 'dark' : 'light'" class="flex flex-col items-center justify-center min-h-screen p-6">
            
            <div class="max-w-lg w-full p-15 rounded-2xl elevated">
                <div class="flex items-center mb-4 gap-4">
                    <h1 class="text-2xl font-bold mb-0 ml-11">Welcome to TTT app</h1>
                    <img src="../assets/logos/mainLogo.png" alt="Logo" class="w-20 h-20 rounded-full mr-4">
                </div>
                <h3 class="text-1xl text-center mb-4">Please, choose an option below:</h3>

                <div class="flex justify-center space-x-4 mb-6">
                    <router-link to="/login">
                        <button class="baseButton">Sign In</button>
                    </router-link>
                    <router-link to="/register">
                        <button class="baseButton">Sign Up</button>
                    </router-link>
                    
                </div>

                <div class="mt-6 flex justify-center">
                    <DarkModeSwitcher />
                </div>
                                
            </div>
            
        </div>
    </BackgroundEffect>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { UserHandler } from '../engine/userHandler';
import { useRouter } from 'vue-router';
import NotificationManager from '../gestors/NotificationManager.vue';
import { delay } from '../utils/generalUtils';


export default {
    components: { DarkModeSwitcher, NotificationManager, BackgroundEffect, ConnectionStatus },
    setup() {
        const api_gestor = API_gestor.getInstance()
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const userHandler = UserHandler.getInstance(api_gestor)
        const router = useRouter()
        const notificationManager = ref(null); // Riferimento per NotificationManager
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
        
        onMounted(async () => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            } else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }

            const userInfoRes = await userHandler.getUserInfo(true)
            if(userInfoRes.userInfo_DB){ //user already logged => redirect to home page
                sendNotify("info","Welcome back "+userInfoRes.userInfo_DB.username+", loading Home Page...")
                await delay(1500)
                router.push("/home")
            }
        });

        return {
            isDarkMode,            
            sendNotify,
            router,
            api_gestor,
            userHandler,
            notificationManager
        }
    }
}

</script>

<style></style>