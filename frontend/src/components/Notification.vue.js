/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
export default (await import('vue')).defineComponent({
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ["success", "error", "warning", "info"].includes(value),
        },
        message: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 10000, // Durata in millisecondi
        },
    },
    data() {
        return {
            visible: true,
            timer: null,
        };
    },
    computed: {
        typeClass() {
            return `notification--${this.type}`;
        },
        icon() {
            const icons = {
                success: "✔️",
                error: "❌",
                warning: "⚠️",
                info: "ℹ️",
            };
            return icons[this.type] || "";
        },
    },
    methods: {
        pauseTimer() {
            clearTimeout(this.timer);
        },
        resumeTimer() {
            this.startTimer();
        },
        startTimer() {
            this.timer = setTimeout(() => {
                this.visible = false;
                this.$emit("dismissed");
            }, this.duration);
        },
    },
    mounted() {
        this.startTimer();
    },
    beforeDestroy() {
        clearTimeout(this.timer);
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    const __VLS_0 = {}.transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        name: ("fade"),
    }));
    const __VLS_2 = __VLS_1({
        name: ("fade"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    if (__VLS_ctx.visible) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onMouseover: (__VLS_ctx.pauseTimer) },
            ...{ onMouseleave: (__VLS_ctx.resumeTimer) },
            ...{ class: ("notification") },
            ...{ class: ((__VLS_ctx.typeClass)) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("icon") },
        });
        (__VLS_ctx.icon);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("message") },
        });
        (__VLS_ctx.message);
    }
    __VLS_5.slots.default;
    var __VLS_5;
    ['notification', 'icon', 'message',];
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
