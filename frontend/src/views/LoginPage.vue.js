import BackgroundEffect from '../components/BackgroundEffect.vue';
import ConnectionStatus from '../components/ConnectionStatus.vue';
import DarkModeSwitcher from '../components/DarkModeSwitcher.vue';
import { ref, onMounted } from 'vue';
import LoginForm from '../components/LoginForm.vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
export default (await import('vue')).defineComponent({
    components: { ConnectionStatus, NotificationManager, DarkModeSwitcher, BackgroundEffect, LoginForm },
    setup() {
        const isOnline = ref(navigator.onLine);
        const user_email = ref("");
        const license_key = ref("");
        const isR_lk_box_opened = ref(false);
        const isDarkMode = ref(localStorage.getItem('theme') === 'dark');
        const notificationManager = ref(null);
        const api_gestor = API_gestor.getInstance();
        function validateEmail() {
            let errors = [];
            if (!user_email.value.trim())
                errors.push("Email is required.");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(user_email.value)) {
                errors.push("Please enter a valid email address.");
            }
            if (errors.length > 0 && notificationManager.value) {
                console.log("notificationManager.value = ", notificationManager.value);
                notificationManager.value.showNotification({
                    type: "error",
                    message: errors[0],
                });
            }
            return errors.length === 0;
        }
        function validateLK() {
            let errors = [];
            if (!license_key.value.trim())
                errors.push("License Key is required for reset");
            const licenseKeyRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
            if (!licenseKeyRegex.test(license_key.value)) {
                errors.push("Invalid license key format");
            }
            if (errors.length > 0 && notificationManager.value) {
                notificationManager.value.showNotification({
                    type: "error",
                    message: errors[0],
                });
            }
            return errors.length === 0;
        }
        async function resendLK() {
            if (!validateEmail()) {
                return;
            }
            const userResponse = await api_gestor.getUserByEmail(user_email.value);
            console.log("userResponse:\n", userResponse);
            if (!userResponse.success) {
                let e_msg = userResponse.errorMessage;
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online";
                }
                notificationManager.value?.showNotification({
                    type: "error",
                    message: e_msg,
                });
                return;
            }
            const response = await api_gestor.sendEmail("license key reminder", userResponse.data.licenseKey, userResponse.data.username, userResponse.data.email);
            console.log("response by api gestor:\n", response);
            if (!response.success) {
                notificationManager.value?.showNotification({
                    type: "error",
                    message: response.errorMessage,
                });
            }
            else {
                notificationManager.value?.showNotification({
                    type: "success",
                    message: "A reminder with the license key was sent to your email",
                });
                isR_lk_box_opened.value = false;
            }
        }
        async function resetLK() {
            if (!validateEmail()) {
                return;
            }
            if (!validateLK()) {
                return;
            }
            const userResponse = await api_gestor.getUserByEmail(user_email.value);
            console.log("userResponse:\n", userResponse);
            if (!userResponse.success) {
                let e_msg = userResponse.errorMessage;
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online";
                }
                notificationManager.value?.showNotification({
                    type: "error",
                    message: e_msg,
                });
                return;
            }
            if (userResponse.data.licenseKey != license_key.value) { //lk provvided by user must be == to lk in user data
                notificationManager.value?.showNotification({
                    type: "error",
                    message: "Invalid License Key",
                });
                return;
            }
            const response = await api_gestor.resetLicenseKey(user_email.value, userResponse.data.licenseKey);
            console.log("response by api gestor (reset lk):\n", response);
            if (!response.success) {
                let e_msg = response.errorMessage;
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online";
                }
                notificationManager.value?.showNotification({
                    type: "error",
                    message: e_msg,
                });
                return;
            }
            const newLK = response.newLicenseKey;
            const sendEmailResponse = await api_gestor.sendEmail("reset license key", newLK, userResponse.data.username, userResponse.data.email);
            if (sendEmailResponse.success) {
                notificationManager.value?.showNotification({
                    type: "success",
                    message: "License Key resetted, please check your email",
                });
                isR_lk_box_opened.value = false;
            }
            else {
                let e_msg = sendEmailResponse.errorMessage;
                if (!isOnline.value) {
                    e_msg = "Bad connection, please try again when you're online";
                }
                notificationManager.value?.showNotification({
                    type: "error",
                    message: e_msg,
                });
            }
        }
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
            resendLK,
            resetLK,
            validateEmail,
            isR_lk_box_opened,
            isDarkMode,
            user_email,
            license_key,
            notificationManager,
            isOnline
        };
    }
}); /* PartiallyEnd: #3632/script.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_componentsOption = { ConnectionStatus, NotificationManager, DarkModeSwitcher, BackgroundEffect, LoginForm };
    let __VLS_components;
    let __VLS_directives;
    ['cancel-button-x',];
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
    const __VLS_7 = {}.BackgroundEffect;
    /** @type { [typeof __VLS_components.BackgroundEffect, typeof __VLS_components.BackgroundEffect, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({}));
    const __VLS_9 = __VLS_8({}, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const __VLS_13 = {}.ConnectionStatus;
    /** @type { [typeof __VLS_components.ConnectionStatus, ] } */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
    const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
    if (!__VLS_ctx.isR_lk_box_opened) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((__VLS_ctx.themeClass)) },
            ...{ class: ("flex flex-col items-center justify-center min-h-screen p-6") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("max-w-lg w-full p-15 rounded-2xl elevated") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex justify-center space-x-4 mb-6") },
        });
        const __VLS_19 = {}.LoginForm;
        /** @type { [typeof __VLS_components.LoginForm, ] } */ ;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({}));
        const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex flex-col items-center justify-center space-y-2") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.isR_lk_box_opened)))
                        return;
                    __VLS_ctx.isR_lk_box_opened = true;
                } },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex flex-col items-center justify-center space-y-2 mt-5") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        const __VLS_25 = {}.RouterLink;
        /** @type { [typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ] } */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
            to: ("/register"),
        }));
        const __VLS_27 = __VLS_26({
            to: ("/register"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: ("baseButton") },
        });
        __VLS_30.slots.default;
        var __VLS_30;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("mt-6 flex justify-center") },
        });
        const __VLS_31 = {}.DarkModeSwitcher;
        /** @type { [typeof __VLS_components.DarkModeSwitcher, ] } */ ;
        // @ts-ignore
        const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
        const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
    }
    if (__VLS_ctx.isR_lk_box_opened) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ((__VLS_ctx.themeClass)) },
            ...{ class: ("flex flex-col items-center justify-center min-h-screen p-6") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("max-w-lg w-full p-15 rounded-2xl elevated relative") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.isR_lk_box_opened)))
                        return;
                    __VLS_ctx.isR_lk_box_opened = false;
                } },
            ...{ class: ("cancel-button-x") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined menu-icon ") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex flex-col items-center justify-center space-y-2") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("mb-4 w-80") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("email"),
            autocomplete: ("off"),
            ...{ class: ("baseInputField") },
            placeholder: ("Email"),
        });
        (__VLS_ctx.user_email);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("mb-4 w-80") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
            type: ("text"),
            autocomplete: ("off"),
            value: ((__VLS_ctx.license_key)),
            ...{ class: ("baseInputField") },
            placeholder: ("Your License Key (for reset)"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex flex-row items-center justify-center gap-x-4") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.resendLK) },
            ...{ class: ("baseButton") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.resetLK) },
            ...{ class: ("baseButton") },
        });
    }
    __VLS_12.slots.default;
    var __VLS_12;
    ['flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'p-6', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'flex', 'justify-center', 'space-x-4', 'mb-6', 'flex', 'flex-col', 'items-center', 'justify-center', 'space-y-2', 'baseButton', 'flex', 'flex-col', 'items-center', 'justify-center', 'space-y-2', 'mt-5', 'baseButton', 'mt-6', 'flex', 'justify-center', 'flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'p-6', 'max-w-lg', 'w-full', 'p-15', 'rounded-2xl', 'elevated', 'relative', 'cancel-button-x', 'material-symbols-outlined', 'menu-icon', 'flex', 'flex-col', 'items-center', 'justify-center', 'space-y-2', 'mb-4', 'w-80', 'baseInputField', 'mb-4', 'w-80', 'baseInputField', 'flex', 'flex-row', 'items-center', 'justify-center', 'gap-x-4', 'baseButton', 'baseButton',];
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
