<template>
    <div>
        <router-view />
    </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 🔹 CORRETTO IMPORT

export default {
    setup() {
        const router = useRouter();
        onMounted(() => {
            router.push("/welcome");
        })
    }
}
</script>

<style>
/* Aggiungi eventuali stili globali qui */
</style>
