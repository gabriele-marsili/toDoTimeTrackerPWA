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
        /*onMounted(() => {
            //get the last route by local storage 
            const lastRoutePath = localStorage.getItem("lastRoutePath");            
            console.log("lastRoutePath in app vue: ",lastRoutePath)
            if (lastRoutePath && router.currentRoute.value.path !== lastRoutePath) {
                router.push(lastRoutePath);
            } else if (!lastRoutePath) {                
                router.push("/welcome");
            }            
        })*/
       return {
        router
       }
    }
}
</script>

<style>
</style>
