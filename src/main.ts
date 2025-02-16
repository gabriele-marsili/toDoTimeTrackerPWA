import { createApp } from 'vue'
import './style.css'
import router from './router'
import WelcomePage from './views/WelcomePage.vue';

const app = createApp(WelcomePage);
app.use(router)
app.mount('#app')
