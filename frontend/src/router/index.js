import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../views/WelcomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import OfflinePage from "../views/OfflinePage.vue";
import HomePage from "../views/HomePage.vue";
const routes = [
    { path: "/", redirect: () => {
            const lastRoutePath = localStorage.getItem("lastRoutePath");
            console.log("lastRoutePath (router): ", lastRoutePath);
            if (lastRoutePath && router.currentRoute.value.path !== lastRoutePath) {
                return lastRoutePath;
            }
            return "/welcome";
        } },
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/welcome", component: WelcomePage },
    { path: "/offline_page", component: OfflinePage },
    { path: "/home", component: HomePage },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});
// save last route in local storage :
router.beforeEach((to, from, next) => {
    localStorage.setItem("lastRoutePath", to.path);
    next();
});
export default router;
