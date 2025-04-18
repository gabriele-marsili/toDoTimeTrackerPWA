import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
export default (await import('vue')).defineComponent({
    setup() {
        const router = useRouter();
        /*onMounted(() => {
            //get the last route by local storage
            const lastRoutePath = localStorage.getItem("lastRoutePath");
            console.log("lastRoutePath in app vue: ",lastRoutePath)
            if (lastRoutePath && router.currentRoute.value.path !== lastRoutePath) {
                router.push(lastRoutePath);
            } else if (!lastRoutePath) {
                router.push("/welcome");
            }
        })*/
        return {
            router
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_0 = {}.RouterView;
    /** @type { [typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
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
