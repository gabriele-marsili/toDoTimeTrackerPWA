/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, computed, onMounted } from 'vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import BackgroundEffect from '../components/BackgroundEffect.vue';
export default (await import('vue')).defineComponent({
    components: { DarkModeSwitcher, BackgroundEffect },
    setup() {
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        onMounted(() => {
            if (isDarkMode.value) {
                document.body.classList.add('dark');
                document.body.classList.remove('light');
            }
            else {
                document.body.classList.add('light');
                document.body.classList.remove('dark');
            }
        });
        // Computed per gestire la classe del tema se necessario
        const themeClass = computed(() => (isDarkMode.value ? 'dark' : 'light'));
        return {
            isDarkMode,
            themeClass,
        };
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { DarkModeSwitcher, BackgroundEffect };
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    const __VLS_0 = {}.BackgroundEffect;
    /** @type { [typeof __VLS_components.BackgroundEffect, typeof __VLS_components.BackgroundEffect, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    var __VLS_6 = {};
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ((__VLS_ctx.themeClass)) },
        ...{ class: ("flex flex-col items-center justify-center min-h-screen p-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("max-w-xl w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex flex-col items-center gap-4 mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
        src: ("../assets/logos/mainLogo.png"),
        alt: ("Logo"),
        ...{ class: ("w-24 h-24 rounded-full") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: ("text-3xl font-bold text-gray-800 dark:text-gray-200") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-gray-600 dark:text-gray-400 mb-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-gray-600 dark:text-gray-400 mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        xmlns: ("http://www.w3.org/2000/svg"),
        ...{ class: ("w-32 h-32 text-gray-500") },
        fill: ("none"),
        viewBox: ("0 0 24 24"),
        stroke: ("currentColor"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.path)({
        'stroke-linecap': ("round"),
        'stroke-linejoin': ("round"),
        'stroke-width': ("2"),
        d: ("M1.05 1.05l21.9 21.9M8.8 8.8a5 5 0 016.4 0m-3.2 3.2a2.5 2.5 0 013.5 0m-9.9-2.1a9.97 9.97 0 0114.1 0"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6") },
    });
    const __VLS_7 = {}.DarkModeSwitcher;
    /** @type { [typeof __VLS_components.DarkModeSwitcher, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_5.slots.default;
    var __VLS_5;
    ['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'p-6', 'max-w-xl', 'w-full', 'p-8', 'bg-white', 'dark:bg-gray-800', 'rounded-2xl', 'shadow-lg', 'text-center', 'flex', 'flex-col', 'items-center', 'gap-4', 'mb-6', 'w-24', 'h-24', 'rounded-full', 'text-3xl', 'font-bold', 'text-gray-800', 'dark:text-gray-200', 'text-gray-600', 'dark:text-gray-400', 'mb-4', 'text-gray-600', 'dark:text-gray-400', 'mb-6', 'mb-6', 'w-32', 'h-32', 'text-gray-500', 'mt-6',];
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
