import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../views/WelcomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";

const routes = [
    { path: "/", component: WelcomePage },
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
