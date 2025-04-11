import { createApp } from 'vue'
import './style_offline.css'



import App_offline from './App_offline.vue';
import router from './router/index.js';
import { registerServiceWorker } from './service_worker/registerSW.js';

registerServiceWorker()

const app = createApp(App_offline);
app.use(router)
app.mount('#app')

console.log("offline app montata")