<template>
    <div>
        <router-view />
    </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const router = useRouter();
        
       return {
        router
       }
    }
}
</script>

<style>
</style>
