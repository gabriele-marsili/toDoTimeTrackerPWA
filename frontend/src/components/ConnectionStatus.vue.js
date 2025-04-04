import { ref, onMounted, onUnmounted, watch } from 'vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import BroadcastListener from './BroadcastListener.vue';
export default (await import('vue')).defineComponent({
    components: { NotificationManager, BroadcastListener },
    setup() {
        const isOnline = ref(navigator.onLine);
        const showBox = ref(!navigator.onLine);
        const notificationManager = ref(null);
        const broadcastListener = ref(null);
        function sendNotify(type, text) {
            if (notificationManager.value) {
                notificationManager.value.showNotification({
                    type: type,
                    message: text,
                });
            }
        }
        function updateOnlineStatus() {
            isOnline.value = navigator.onLine;
        }
        // Watch for changes to the online status to control the visibility of the box.
        watch(isOnline, (val) => {
            if (val) {
                // Show the box when connection is restored, then hide it after 5 seconds.
                showBox.value = true;
                setTimeout(() => {
                    showBox.value = false;
                }, 5000);
            }
            else {
                // Immediately show the box if connection is lost.
                showBox.value = true;
            }
        });
        onMounted(() => {
            window.addEventListener('online', updateOnlineStatus);
            window.addEventListener('offline', updateOnlineStatus);
        });
        onUnmounted(() => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        });
        return {
            broadcastListener,
            isOnline,
            showBox,
            notificationManager,
            updateOnlineStatus,
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { NotificationManager, BroadcastListener };
    let __VLS_components;
    let __VLS_directives;
    ['connection-box',];
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
    const __VLS_7 = {}.BroadcastListener;
    /** @type { [typeof __VLS_components.BroadcastListener, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        ref: ("broadcastListener"),
    }));
    const __VLS_9 = __VLS_8({
        ref: ("broadcastListener"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    // @ts-ignore navigation for `const broadcastListener = ref()`
    /** @type { typeof __VLS_ctx.broadcastListener } */ ;
    var __VLS_13 = {};
    var __VLS_12;
    const __VLS_14 = {}.transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ] } */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
        name: ("fade"),
    }));
    const __VLS_16 = __VLS_15({
        name: ("fade"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    if (__VLS_ctx.showBox) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("connection-box") },
        });
        if (__VLS_ctx.isOnline) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("material-symbols-outlined g-icon") },
            });
        }
        if (!__VLS_ctx.isOnline) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("material-symbols-outlined g-icon") },
            });
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("message") },
        });
        (__VLS_ctx.isOnline ? "You're back online" : "No internet connection. Searching for connection...");
    }
    __VLS_19.slots.default;
    var __VLS_19;
    ['connection-box', 'material-symbols-outlined', 'g-icon', 'material-symbols-outlined', 'g-icon', 'message',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_6,
        'broadcastListener': __VLS_13,
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
