<template>
    <BackgroundEffect>
        <div :class="themeClass" class="flex flex-col items-center justify-center min-h-screen p-6">
            <div class="max-w-xl w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
                <div class="flex flex-col items-center gap-4 mb-6">
                    <img src="../assets/logos/mainLogo.png" alt="Logo" class="w-24 h-24 rounded-full">
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
                        Ops...You look offline!
                    </h1>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                    It looks like you are not connected to the Internet. 
                    To use all the features of the TTT app, an active connection is required.
                </p>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Reconnect for the full experience or explore available offline features.
                </p>
                <!-- Illustrazione offline -->
                <div class="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32 text-gray-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <!-- Esempio di icona "Wi-Fi Off" -->
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1.05 1.05l21.9 21.9M8.8 8.8a5 5 0 016.4 0m-3.2 3.2a2.5 2.5 0 013.5 0m-9.9-2.1a9.97 9.97 0 0114.1 0" />
                    </svg>
                </div>
                <div class="mt-6">
                    <DarkModeSwitcher />
                </div>
            </div>
        </div>
    </BackgroundEffect>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';

export default {
    components: { DarkModeSwitcher, BackgroundEffect },
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

        // Computed per gestire la classe del tema se necessario
        const themeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'));

        return {
            isDarkMode,
            themeClass,
        };
    },
};
</script>

<style scoped>

</style>