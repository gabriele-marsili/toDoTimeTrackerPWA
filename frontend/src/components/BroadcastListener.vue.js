import { onMounted } from 'vue';
import { SW_BROADCAST_CHANNEL } from '../utils/generalUtils';
import router from '../router/index';
onMounted(() => {
    const channel = new BroadcastChannel(SW_BROADCAST_CHANNEL);
    channel.addEventListener("message", (event) => {
        console.log("new message on sw broadcast channel | event:\n", event);
        if (event.data.type == "offline" && event.data.content == "load offline-redirect page") {
            // to do -> load offline page by router
            let routes = router.getRoutes();
            console.log("routes:\n", routes);
            for (let r of routes) {
                if (r.path == "offline_page") {
                    router.addRoute(r);
                    break;
                }
            }
        }
    });
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
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
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
