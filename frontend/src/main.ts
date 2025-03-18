import { createApp } from 'vue'
import './style.css'
import router from './router'
import App from './App.vue';
import { registerServiceWorker } from './service_worker/registerSW';

registerServiceWorker()

const app = createApp(App);
app.use(router)
app.mount('#app')


