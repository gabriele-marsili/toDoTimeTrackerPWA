import { ref, onMounted } from 'vue';
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
        return {
            isDarkMode
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
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
        ...{ class: ("max-w-lg w-full p-15 rounded-2xl elevated") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex items-center mb-4 gap-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: ("text-2xl font-bold mb-0 ml-11") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img, __VLS_intrinsicElements.img)({
        src: ("../assets/logos/mainLogo.png"),
        alt: ("Logo"),
        ...{ class: ("w-20 h-20 rounded-full mr-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: ("text-1xl text-center mb-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex justify-center space-x-4 mb-6") },
    });
    const __VLS_7 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        to: ("/login"),
    }));
    const __VLS_9 = __VLS_8({
        to: ("/login"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: ("baseButton") },
    });
    __VLS_12.slots.default;
    var __VLS_12;
    const __VLS_13 = {}.RouterLink;
    /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        to: ("/register"),
    }));
    const __VLS_15 = __VLS_14({
        to: ("/register"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ class: ("baseButton") },
    });
    __VLS_18.slots.default;
    var __VLS_18;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6 flex justify-center") },
    });
    const __VLS_19 = {}.DarkModeSwitcher;
    /** @type { [typeof __VLS_components.DarkModeSwitcher, ] } */ ;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({}));
    const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
    __VLS_5.slots.default;
    var __VLS_5;
    ['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'p-6', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'flex', 'items-center', 'mb-4', 'gap-4', 'text-2xl', 'font-bold', 'mb-0', 'ml-11', 'w-20', 'h-20', 'rounded-full', 'mr-4', 'text-1xl', 'text-center', 'mb-4', 'flex', 'justify-center', 'space-x-4', 'mb-6', 'baseButton', 'baseButton', 'mt-6', 'flex', 'justify-center',];
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
