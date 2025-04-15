<template>
    <NotificationManager ref="notificationManager" />
    <form @submit.prevent="login">
        <div class="flex flex-col items-center justify-center ">

            <!--
            <div class="mb-4 w-80">
                
                <input v-model="email" class="baseInputField" autocomplete="off"
                    placeholder="Email">
            </div>
            -->

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
import { API_gestor } from "../backend-comunication/api_comunication";
import { useRouter } from "vue-router";
import { delay } from "../utils/generalUtils";

export default {
    components: { NotificationManager },
    setup() {
        const isOnline = ref(navigator.onLine)
        const licensekey = ref("");
        const notificationManager = ref(null); // Riferimento per NotificationManager
        const apiGestor = API_gestor.getInstance()
        const router = useRouter()
        const login = async () => {
            notificationManager.value.showNotification({
                type: "info",
                message: "Logging in...",
            });

            // Rimuove eventuali spazi vuoti iniziali e finali
            const licenseKeyValue = licensekey.value.trim();

            // Controllo se i campi sono vuoti
            if (!licenseKeyValue) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Empty field : please insert the license key",
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

            const loginResponse = await apiGestor.loginWithLicenseKey(licenseKeyValue)
            if (!loginResponse.success) {
                let e_msg = loginResponse.errorMessage
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online"
                }

                notificationManager.value.showNotification({
                    type: "error",
                    message: e_msg,
                });
                return;
            }


            notificationManager.value.showNotification({
                type: "success",
                message: "Logged successfully",
            });

            await delay(1500)
            router.push("/home") //load home page after login
        };



        return {
            login,
            notificationManager,
            licensekey,
            router,
            isOnline
        }
    }
}

</script>