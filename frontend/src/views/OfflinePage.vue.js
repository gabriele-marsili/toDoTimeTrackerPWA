import { ref, computed, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { useRouter } from 'vue-router';
import { delay } from '../utils/generalUtils';
export default (await import('vue')).defineComponent({
    components: { DarkModeSwitcher, BackgroundEffect, NotificationManager },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const notificationManager = ref(null);
        const router = useRouter();
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
        function handleChangeDarkMode(args) {
            isDarkMode.value = args.isDarkMode;
        }
        async function tryToReconnect() {
            if (navigator.onLine) {
                await backOnline();
            }
            else {
                sendNotify("error", "Sadly you're still offline");
            }
        }
        async function backOnline() {
            sendNotify("success", "You're back online, loading welcome page...");
            await delay(1400);
            router.push("/welcome");
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
            //add listener to catch when the user will came back online:
            window.addEventListener('online', backOnline);
        });
        // Computed per gestire la classe del tema se necessario
        const themeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'));
        return {
            router,
            isDarkMode,
            sendNotify,
            themeClass,
            handleChangeDarkMode,
            backOnline,
            tryToReconnect,
            notificationManager
        };
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { DarkModeSwitcher, BackgroundEffect, NotificationManager };
    let __VLS_components;
    let __VLS_directives;
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
    const __VLS_0 = {}.NotificationManager;
    /** @type { [typeof __VLS_components.NotificationManager, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ref: ("notificationManager"),
    }));
    const __VLS_2 = __VLS_1({
        ref: ("notificationManager"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const notificationManager = ref()`
    /** @type { typeof __VLS_ctx.notificationManager } */ ;
    var __VLS_6 = {};
    var __VLS_5;
    const __VLS_7 = {}.BackgroundEffect;
    /** @type { [typeof __VLS_components.BackgroundEffect, typeof __VLS_components.BackgroundEffect, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ((__VLS_ctx.themeClass)) },
        ...{ class: ("flex flex-col items-center justify-center min-h-screen p-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("max-w-lg w-full p-15 rounded-2xl elevated shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex flex-col items-center gap-4 mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
        src: ("../assets/logos/mainLogo.png"),
        alt: ("Logo"),
        ...{ class: ("w-24 h-24 rounded-full") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex flex-row items-center gap-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: ("text-3xl font-bold") },
        ...{ class: ((__VLS_ctx.isDarkMode ? 'text-white' : 'text-black')) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon ") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("mb-4") },
        ...{ class: ((__VLS_ctx.isDarkMode ? 'text-white' : 'text-black')) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("mb-4") },
        ...{ class: ((__VLS_ctx.isDarkMode ? 'text-white' : 'text-black')) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ((__VLS_ctx.isDarkMode ? 'text-white' : 'text-black')) },
        ...{ class: ("mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6 flex justify-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.tryToReconnect) },
        ...{ class: ("baseButton") },
    });
    if (__VLS_ctx.isDarkMode) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("text-white") },
        });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("text-black") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined g-icon ") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6 flex justify-center") },
    });
    const __VLS_13 = {}.DarkModeSwitcher;
    /** @type { [typeof __VLS_components.DarkModeSwitcher, ] } */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        ...{ 'onChangeDarkMode': {} },
    }));
    const __VLS_15 = __VLS_14({
        ...{ 'onChangeDarkMode': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    let __VLS_19;
    const __VLS_20 = {
        onChangeDarkMode: (__VLS_ctx.handleChangeDarkMode)
    };
    let __VLS_16;
    let __VLS_17;
    var __VLS_18;
    __VLS_12.slots.default;
    var __VLS_12;
    ['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'p-6', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'shadow-lg', 'text-center', 'flex', 'flex-col', 'items-center', 'gap-4', 'mb-6', 'w-24', 'h-24', 'rounded-full', 'flex', 'flex-row', 'items-center', 'gap-4', 'text-3xl', 'font-bold', 'material-symbols-outlined', 'g-icon', 'mb-4', 'mb-4', 'mb-6', 'mt-6', 'flex', 'justify-center', 'baseButton', 'text-white', 'text-black', 'material-symbols-outlined', 'g-icon', 'mt-6', 'flex', 'justify-center',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_6,
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
