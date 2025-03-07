import Notification from '../components/Notification.vue';
export default (await import('vue')).defineComponent({
    components: { Notification },
    data() {
        return {
            currentNotification: null,
        };
    },
    methods: {
        showNotification(notification) {
            if (this.currentNotification) {
                this.dismissNotification();
            }
            this.currentNotification = notification;
        },
        dismissNotification() {
            if (this.currentNotification != null) {
                this.currentNotification = null;
            }
        },
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { Notification };
    let __VLS_components;
    let __VLS_directives;
    if (__VLS_ctx.currentNotification) {
        const __VLS_0 = {}.Notification;
        /** @type { [typeof __VLS_components.Notification, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onDismissed': {} },
            type: ((__VLS_ctx.currentNotification.type)),
            message: ((__VLS_ctx.currentNotification.message)),
            duration: ((__VLS_ctx.currentNotification.duration)),
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onDismissed': {} },
            type: ((__VLS_ctx.currentNotification.type)),
            message: ((__VLS_ctx.currentNotification.message)),
            duration: ((__VLS_ctx.currentNotification.duration)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_6;
        const __VLS_7 = {
            onDismissed: (__VLS_ctx.dismissNotification)
        };
        let __VLS_3;
        let __VLS_4;
        var __VLS_5;
    }
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
let __VLS_self;
