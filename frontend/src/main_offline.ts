import { createApp } from 'vue'
import './style_offline.css'
import router from './router'
import App_offline from './App_offline.vue';

import { registerServiceWorker } from './service_worker/registerSW';

registerServiceWorker()

const app = createApp(App_offline);
app.use(router)
app.mount('#app')

console.log("offline app montata")