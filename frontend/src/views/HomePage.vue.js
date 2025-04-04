import { ref, onMounted } from 'vue';
import Sidebar from '../components/Sidebar.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import ToDoList from '../components/ToDoList.vue';
import { ToDoAction } from '../types/utilityTypes';
export default (await import('vue')).defineComponent({
    components: { Sidebar, NotificationManager, ConnectionStatus, ToDoList },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const todayToDoActions = ref([]);
        const user = ref({
            name: "UserName",
            image: "", //to do : insert default photo image
        });
        const notificationManager = ref(null); // Riferimento per NotificationManager
        const handleSectionChange = (newSection) => {
            console.log(`Navigating to section: ${newSection}`);
        };
        function sendNotify(type, text) {
            if (notificationManager.value) {
                notificationManager.value.showNotification({
                    type: type,
                    message: text,
                });
            }
            else {
                console.log("notification manager not found");
            }
        }
        onMounted(() => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            }
            else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }
            // Mostra una notifica di benvenuto dopo il montaggio
            setTimeout(() => {
                sendNotify("info", "Welcome back in TTT App");
            }, 300);
            //construct fake to to for testing :
            let i = 0;
            let today = new Date().getDay();
            while (i < 5) {
                i++;
                let t = new ToDoAction(`TdA ${i}`, `TdA ${i}`, i, new Date(), new Date(today + 1), new Date(), 'description of the action');
                todayToDoActions.value.push(t);
            }
            //to do : ask to do by api / cache
        });
        return {
            user,
            isDarkMode,
            handleSectionChange,
            notificationManager,
            sendNotify,
            todayToDoActions
        };
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { Sidebar, NotificationManager, ConnectionStatus, ToDoList };
    let __VLS_components;
    let __VLS_directives;
    ['user-menu', 'bottone', 'selettore', 'reset_button', 'reset_button', 'apply_button', 'apply_button', 'cancel_button', 'cancel_button',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.link, __VLS_intrinsicElements.link)({
        href: ("https://fonts.googleapis.com/icon?family=Material+Icons+Sharp"),
        rel: ("stylesheet"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.link, __VLS_intrinsicElements.link)({
        href: ("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"),
        rel: ("stylesheet"),
    });
    const __VLS_0 = {}.ConnectionStatus;
    /** @type { [typeof __VLS_components.ConnectionStatus, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("home-app") },
    });
    const __VLS_6 = {}.Sidebar;
    /** @type { [typeof __VLS_components.Sidebar, ] } */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        ...{ 'onUpdate:activeSection': {} },
        activeSection: (('home')),
    }));
    const __VLS_8 = __VLS_7({
        ...{ 'onUpdate:activeSection': {} },
        activeSection: (('home')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    let __VLS_12;
    const __VLS_13 = {
        'onUpdate:activeSection': (__VLS_ctx.handleSectionChange)
    };
    let __VLS_9;
    let __VLS_10;
    var __VLS_11;
    const __VLS_14 = {}.NotificationManager;
    /** @type { [typeof __VLS_components.NotificationManager, ] } */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
        ref: ("notificationManager"),
    }));
    const __VLS_16 = __VLS_15({
        ref: ("notificationManager"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    // @ts-ignore navigation for `const notificationManager = ref()`
    /** @type { typeof __VLS_ctx.notificationManager } */ ;
    var __VLS_20 = {};
    var __VLS_19;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("main-content") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("content-grid") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_21 = {}.ToDoList;
    /** @type { [typeof __VLS_components.ToDoList, typeof __VLS_components.ToDoList, ] } */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        todos: ((__VLS_ctx.todayToDoActions)),
        viewMode: ("list"),
    }));
    const __VLS_23 = __VLS_22({
        todos: ((__VLS_ctx.todayToDoActions)),
        viewMode: ("list"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("last-box") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("sub-box max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("footer  p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    ['home-app', 'main-content', 'content-grid', 'box', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center', 'box', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center', 'last-box', 'sub-box', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center', 'sub-box', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center', 'footer', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_20,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
let __VLS_self;
