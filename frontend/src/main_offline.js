import { createApp } from 'vue';
import './style.css';
import router from './router';
import App_offline from './App_offline.vue';
const app = createApp(App_offline);
app.use(router);
app.mount('#app');
console.log("offline app montata");
