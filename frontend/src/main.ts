import { createApp } from 'vue'
import './style.css'
import App from './App.vue';
import { registerServiceWorker } from './service_worker/registerSW.js';
import router from './router/index.js';

registerServiceWorker

const app = createApp(App);
app.use(router)
app.mount('#app')


