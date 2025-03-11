<template>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">

    <NotificationManager ref="notificationManager" />

    <BackgroundEffect>
        <div v-if="!isR_lk_box_opened" :class="themeClass"
            class="flex flex-col items-center justify-center min-h-screen p-6">
            <div class="max-w-lg w-full p-15 rounded-2xl elevated">
                <div class="flex justify-center space-x-4 mb-6">
                    <LoginForm />
                </div>

                <div class="flex flex-col items-center justify-center space-y-2">
                    <p>Don't remember your license key?</p>
                    <button class="baseButton" @click="isR_lk_box_opened = true">Resend or reset license key</button>
                </div>

                <div class="flex flex-col items-center justify-center space-y-2 mt-5">
                    <p>Don't have an account yet?</p>
                    <router-link to="/register">
                        <button class="baseButton">Sign Up</button>
                    </router-link>
                </div>

                <div class="mt-6 flex justify-center">
                    <DarkModeSwitcher />
                </div>
            </div>
        </div>

        <div v-if="isR_lk_box_opened" :class="themeClass"
            class="flex flex-col items-center justify-center min-h-screen p-6">
            <div class="max-w-lg w-full p-15 rounded-2xl elevated relative">

                <button class="cancel-button-x" @click="isR_lk_box_opened = false">
                    <span class="material-symbols-outlined menu-icon ">close</span>
                </button>

                <div class="flex flex-col items-center justify-center space-y-2">



                    <p>Insert your email, then reset or resend license key</p>

                    <div class="mb-4 w-80">
                        <input type="email" autocomplete="off" v-model="user_email" class="baseInputField"
                            placeholder="Email">
                    </div>

                    <div class="mb-4 w-80">
                        <input type="text" autocomplete="off" v-model="license_key" class="baseInputField"
                            placeholder="Your License Key (for reset)">
                    </div>

                    <div class="flex flex-row items-center justify-center gap-x-4">
                        <button class="baseButton" @click="resendLK">Resend License Key</button>
                        <button class="baseButton" @click="resetLK">Reset License Key</button>
                    </div>
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
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
export default {
    components: { NotificationManager, DarkModeSwitcher, BackgroundEffect, LoginForm },
    setup() {
        const user_email = ref("")
        const license_key = ref("")
        const isR_lk_box_opened = ref(false);
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const notificationManager = ref(null);
        const api_gestor = API_gestor.getInstance()

        function validateEmail() {
            let errors = [];
            if (!user_email.value.trim()) errors.push("Email is required.");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(user_email.value)) {
                errors.push("Please enter a valid email address.");
            }

            if (errors.length > 0 && notificationManager.value) {
                console.log("notificationManager.value = ", notificationManager.value)
                notificationManager.value.showNotification({
                    type: "error",
                    message: errors[0],
                });
            }
            return errors.length === 0;
        }

        function validateLK() {
            let errors = [];
            if (!license_key.value.trim()) errors.push("License Key is required for reset");

            const licenseKeyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            if (!licenseKeyRegex.test(license_key.value)) {
                errors.push("Invalid license key format");
            }

            if (errors.length > 0 && notificationManager.value) {                
                notificationManager.value.showNotification({
                    type: "error",
                    message: errors[0],
                });
            }
            return errors.length === 0;
        }

        async function resendLK() {
            if (!validateEmail()) {
                return;
            }
            const userResponse = await api_gestor.getUserByEmail(user_email.value)
            console.log("userResponse:\n", userResponse)
            if (!userResponse.success) {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: userResponse.errorMessage,
                });
                return;
            }

            const response = await api_gestor.sendEmail("license key reminder", userResponse.data.licenseKey, userResponse.data.username, userResponse.data.email);
            console.log("response by api gestor:\n", response);
            if (!response.success) {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: response.errorMessage,
                });
            } else {
                notificationManager.value?.showNotification({
                    type: "success",
                    message: "A reminder with the license key was sent to your email",
                });
                isR_lk_box_opened.value = false;
            }


        }

        async function resetLK() {
            if (!validateEmail()) {
                return;
            }

            if (!validateLK()) {
                return;
            }

            const userResponse = await api_gestor.getUserByEmail(user_email.value)
            console.log("userResponse:\n", userResponse)
            if (!userResponse.success) {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: userResponse.errorMessage,
                });
                return;
            }

            if(userResponse.data.licenseKey != license_key.value){ //lk provvided by user must be == to lk in user data
                notificationManager.value?.showNotification({
                    type: "error",
                    message: "Invalid License Key",
                });
                return;
            }

            const response = await api_gestor.resetLicenseKey(user_email.value, userResponse.data.licenseKey)
            console.log("response by api gestor (reset lk):\n", response);
            if (!response.success) {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: response.errorMessage,
                });
                return;
            }


            const newLK = response.newLicenseKey;
            const sendEmailResponse = await api_gestor.sendEmail("reset license key", newLK, userResponse.data.username, userResponse.data.email)
            if (sendEmailResponse.success) {
                notificationManager.value?.showNotification({
                    type: "success",
                    message: "License Key resetted, please check your email",
                });
                isR_lk_box_opened.value = false;
            } else {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: sendEmailResponse.errorMessage,
                });
            }

        }

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
            resendLK,
            resetLK,
            validateEmail,
            isR_lk_box_opened,
            isDarkMode,
            user_email,
            license_key,
            notificationManager
        }
    }

}
</script>

<style scoped>
.cancel-button-x {
    position: absolute;
    top: 3%;
    /* Distanza dall'alto */
    right: 3%;
    /* Distanza da destra */
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    /* Dimensioni pulsante */
    height: 30px;
    color: white;
    background: transparent;
    border: 2px solid transparent;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1rem;
    transition: background-color 0.3s ease, border-color 0.3s ease;
    border-radius: 80%;
}

/* Cambia colore al passaggio del mouse */
.cancel-button-x:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
}
</style>