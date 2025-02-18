<template>
    <NotificationManager ref="notificationManager" />
    <form @submit.prevent="login">
        <div class="flex flex-col items-center justify-center ">
            <div class="mb-4 w-80">
                <!--<label class="block text-sm font-medium mb-1">Email</label>-->
                <input v-model="email" class="baseInputField" autocomplete="off"
                    placeholder="Email">
            </div>

            <div class="mb-4 w-80">
                <!--<label class="block text-sm font-medium mb-1">License Key</label>-->
                <input v-model="licensekey" class="baseInputField" placeholder="License Key">
            </div>

            <button @click="login" type="submit" class="baseButton w-30">
                Login
            </button>
        </div>
    </form>
</template>

<script>
import { ref } from "vue";
import NotificationManager from '../gestors/NotificationManager.vue';

export default {
    components: { NotificationManager },
    setup() {
        const email = ref("");
        const licensekey = ref("");
        const notificationManager = ref(null); // Riferimento per NotificationManager

        const login = () => {            

            // Rimuove eventuali spazi vuoti iniziali e finali
            const emailValue = email.value.trim();
            const licenseKeyValue = licensekey.value.trim();

            // Controllo se i campi sono vuoti
            if (!emailValue || !licenseKeyValue) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Empty field : please insert both email and license key",
                });
                return;
            }

            // Controllo validità email con regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Invalid email format",
                });
                return;
            }

            // Controllo validità license key (adatta la regex al formato desiderato)
            const licenseKeyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            if (!licenseKeyRegex.test(licenseKeyValue)) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Invalid license key format",
                });
                return;
            }

            // Se tutto è valido, procedi con il login
            console.log("Login con:", emailValue, licenseKeyValue);
        };



        return {
            login,
            notificationManager,
            email,
            licensekey
        }
    }
}

</script>