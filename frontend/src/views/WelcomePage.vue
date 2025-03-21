<template>
    <BackgroundEffect>
        <ConnectionStatus />
        <div :class="themeClass" class="flex flex-col items-center justify-center min-h-screen p-6">
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

<script>
import { ref, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';


export default {
    components: { DarkModeSwitcher, BackgroundEffect, ConnectionStatus },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

        onMounted(() => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            } else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }
        });

        return {
            isDarkMode
        }
    }
}

</script>

<style></style>