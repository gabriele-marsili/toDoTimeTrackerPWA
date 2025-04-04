import { ref } from "vue";
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from "../backend-comunication/api_comunication";
export default (await import('vue')).defineComponent({
    components: { NotificationManager },
    setup() {
        const isOnline = ref(navigator.onLine);
        const licensekey = ref("");
        const notificationManager = ref(null); // Riferimento per NotificationManager
        const apiGestor = API_gestor.getInstance();
        const login = async () => {
            // Rimuove eventuali spazi vuoti iniziali e finali
            const licenseKeyValue = licensekey.value.trim();
            // Controllo se i campi sono vuoti
            if (!licenseKeyValue) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Empty field : please insert the license key",
                });
                return;
            }
            // Controllo validità license key (adatta la regex al formato desiderato)
            const licenseKeyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            if (!licenseKeyRegex.test(licenseKeyValue)) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: "Invalid license key format",
                });
                return;
            }
            const loginResponse = await apiGestor.loginWithLicenseKey(licenseKeyValue);
            if (!loginResponse.success) {
                let e_msg = loginResponse.errorMessage;
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online";
                }
                notificationManager.value.showNotification({
                    type: "error",
                    message: e_msg,
                });
                return;
            }
            notificationManager.value.showNotification({
                type: "success",
                message: "Logged successfully",
            });
        };
        return {
            login,
            notificationManager,
            licensekey,
            isOnline
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { NotificationManager };
    let __VLS_components;
    let __VLS_directives;
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
        ...{ onSubmit: (__VLS_ctx.login) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("flex flex-col items-center justify-center ") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mb-4 w-80") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
        ...{ class: ("baseInputField") },
        placeholder: ("License Key"),
    });
    (__VLS_ctx.licensekey);
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.login) },
        type: ("submit"),
        ...{ class: ("baseButton w-30") },
    });
    ['flex', 'flex-col', 'items-center', 'justify-center', 'mb-4', 'w-80', 'baseInputField', 'baseButton', 'w-30',];
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
