import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../views/WelcomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import OfflinePage from "../views/OfflinePage.vue";
import HomePage from "../views/HomePage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import SettingsPage from "../views/SettingsPage.vue";
import ShopPage from "../views/ShopPage.vue";
import TimeTrackerPage from "../views/TimeTrackerPage.vue";
import ToDoCalendarPage from "../views/ToDoCalendarPage.vue";
import StatsPage from "../views/StatsPage.vue";


const routes = [    
    { path: "/", redirect: () => {
        const lastRoutePath = localStorage.getItem("lastRoutePath");
        console.log("lastRoutePath (router): ",lastRoutePath)
        if (lastRoutePath && router.currentRoute.value.path !== lastRoutePath) {
            return lastRoutePath
        }         
        return "/welcome";
   }},
    { path: "/login", component: LoginPage },
    { path: "/register", component: RegisterPage },
    { path: "/welcome", component : WelcomePage},
    { path: "/offline_page", component : OfflinePage},
    { path: "/home", component : HomePage},
    { path: "/profile_page", component : ProfilePage},
    { path: "/settings", component : SettingsPage},
    { path: "/shop", component : ShopPage},
    { path: "/time_tracker", component : TimeTrackerPage},
    { path: "/calendar_and_todo", component : ToDoCalendarPage},
    { path: "/stats", component : StatsPage},
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
