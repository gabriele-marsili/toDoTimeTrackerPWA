<template>
    <BackgroundEffect>
        <div :class="themeClass" class="flex flex-col items-center justify-center max-h-screen p-6">
            <!-- Contenitore con altezza massima e scroll interno -->
            <div class="w-full max-w-5xl p-8 rounded-2xl elevated max-h-screen overflow-y-auto">
                <div class="flex justify-center space-x-4 mb-6">
                    <RegistrationForm />
                </div>

                <div class="flex flex-col items-center justify-center space-y-2">
                    <p>Already have an account?</p>
                    <router-link to="/login">
                        <button class="baseButton">Sign In</button>
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
import { onMounted, ref } from 'vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import RegistrationForm from '../components/RegistrationForm.vue';

export default {
    components: { RegistrationForm, BackgroundEffect, DarkModeSwitcher },
    setup() {
        const isDarkMode = ref(localStorage.getItem("theme") === "dark");

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
        };
    }
};
</script>

<style>
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
}


</style>