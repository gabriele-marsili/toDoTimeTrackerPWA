import { ref, onMounted } from "vue";
const isDark = ref(localStorage.getItem("theme") === "dark");
const emit = defineEmits(["changeDarkMode"]);
const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
    if (isDark.value) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
    else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    }
    emit('changeDarkMode', { isDarkMode: isDark.value });
};
onMounted(() => {
    document.documentElement.classList.toggle("dark", isDark.value);
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("row-disposition") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleDarkMode) },
        ...{ class: ("baseButton") },
    });
    if (__VLS_ctx.isDark) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("text-yellow-400") },
        });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("text-gray-900") },
        });
    }
    ['row-disposition', 'baseButton', 'text-yellow-400', 'text-gray-900',];
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
        return {
            $emit: emit,
            isDark: isDark,
            toggleDarkMode: toggleDarkMode,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $emit: emit,
        };
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
