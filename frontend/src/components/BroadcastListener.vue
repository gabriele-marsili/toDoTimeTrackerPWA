<template>

</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { SW_BROADCAST_CHANNEL } from '../utils/generalUtils'
import { broadcastChannelMessage } from '../types/utilityTypes'
import router from '../router/index'

onMounted(() => {
    const channel = new BroadcastChannel(SW_BROADCAST_CHANNEL);

    channel.addEventListener("message", (event : MessageEvent<broadcastChannelMessage>) => {        
        console.log("new message on sw broadcast channel | event:\n",event)
        if(event.data.type == "offline" && event.data.content == "load offline-redirect page"){            
            let routes = router.getRoutes()
            console.log("routes:\n",routes)
            for(let r of routes){
                if(r.path == "offline_page"){
                    router.addRoute(r);
                    break;
                }
            }
            
            
        }
    });
})


</script>