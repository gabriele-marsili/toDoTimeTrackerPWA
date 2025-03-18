import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../views/WelcomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import OfflinePage from "../views/OfflinePage.vue";
const routes = [
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/welcome", component: WelcomePage },
    { path: "/offline_page", component: OfflinePage },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
export default router;
