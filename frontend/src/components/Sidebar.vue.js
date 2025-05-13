import { ref } from 'vue';
export default (await import('vue')).defineComponent({
    name: 'Sidebar',
    props: {
        activeSection: {
            type: String,
            required: true, // Deve essere passato dinamicamente dalla pagina
        },
    },
    setup(props, { emit }) {
        const isHovered = ref(false);
        const sections = [
            { name: 'home', label: 'Home', icon: 'home' },
            { name: 'calendar', label: 'Calendar', icon: 'calendar_month' },
            { name: 'time_tracker', label: 'Time Tracker', icon: 'schedule' },
            { name: 'stats', label: 'Stats', icon: 'analytics' },
            { name: 'shop', label: 'Shop', icon: 'store' },
            { name: 'profile', label: 'Profile', icon: 'account_circle' },
            { name: 'settings', label: 'Settings', icon: 'settings' },
        ];
        const navigateTo = async (section) => {
            console.log("going to navigate to ", section);
            try {
                
            }
            catch (error) {
                console.error('Errore nella navigazione:', error);
            }
        };
        const logout = async () => {
            
            console.log("logout res = ", r);
        };
        return {
            isHovered,
            sections,
            navigateTo,
            logout,
        };
    },
});
; /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['sidebar', 'sidebar', 'expanded', 'sidebar', 'expanded', 'menu-item', 'menu-item', 'menu-item', 'active', 'menu-item', 'active', 'menu-item', 'logout',];
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMouseenter: (...[$event]) => {
                __VLS_ctx.isHovered = true;
            } },
        ...{ onMouseleave: (...[$event]) => {
                __VLS_ctx.isHovered = false;
            } },
        ...{ class: ("sidebar") },
        ...{ class: (({ expanded: __VLS_ctx.isHovered })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("logo-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.img)({
        src: ("../assets/logos/mainLogo.png"),
        alt: ("TTT Logo"),
        ...{ class: ("logo w-12 h-12 rounded-full") },
    });
    if (__VLS_ctx.isHovered) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("logo-text") },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
        ...{ class: ("menu") },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.sections))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.navigateTo(section.name);
                } },
            key: ((section.name)),
            ...{ class: ("menu-item") },
            ...{ class: (({ active: section.name === __VLS_ctx.activeSection })) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined menu-icon") },
        });
        (section.icon);
        if (__VLS_ctx.isHovered) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("menu-text") },
            });
            (section.label);
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.logout) },
        ...{ class: ("menu-item logout") },
        ...{ class: (({ active: __VLS_ctx.activeSection === 'logout' })) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: ("material-symbols-outlined menu-icon") },
    });
    if (__VLS_ctx.isHovered) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("menu-text") },
        });
    }
    ['sidebar', 'expanded', 'logo-container', 'logo', 'w-12', 'h-12', 'rounded-full', 'logo-text', 'menu', 'menu-item', 'active', 'material-symbols-outlined', 'menu-icon', 'menu-text', 'menu-item', 'logout', 'active', 'material-symbols-outlined', 'menu-icon', 'menu-text',];
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
