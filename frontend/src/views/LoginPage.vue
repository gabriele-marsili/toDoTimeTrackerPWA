<template>
    <BackgroundEffect>
        <div :class="themeClass" class="flex flex-col items-center justify-center min-h-screen p-6">
            <div class="max-w-lg w-full p-15 rounded-2xl elevated">

                <div class="flex justify-center space-x-4 mb-6">
                    <LoginForm />
                </div>

                <div class="flex flex-col items-center justify-center space-y-2">
                    <p>You don't have an account yet?</p>
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
import BackgroundEffect from '../components/BackgroundEffect.vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import { ref, onMounted } from 'vue';
import LoginForm from '../components/LoginForm.vue';
export default {
    components: { DarkModeSwitcher, BackgroundEffect, LoginForm },
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