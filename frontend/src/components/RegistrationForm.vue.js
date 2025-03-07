import { ref, reactive, computed } from 'vue';
import NotificationManager from '../gestors/NotificationManager.vue';
import { API_gestor } from '../backend-comunication/api_comunication';
import { delay } from '../utils/generalUtils';
const totalPoints = 100;
const form = reactive({
    // Personal Information
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    phone: '',
    // Questionnaire Categories (default ones)
    categories: [
        { name: 'Sport', points: 1 },
        { name: 'Work', points: 1 },
        { name: 'Study', points: 1 },
        { name: 'Social', points: 1 },
        { name: 'Movies', points: 1 },
        { name: 'Reading', points: 1 },
        { name: 'New Skills', points: 1 },
        { name: 'New Interests', points: 1 },
        { name: 'Travel', points: 1 },
        { name: 'Music', points: 1 }
    ],
    // Preferences and Terms
    notifications: false,
    permissions: false,
    timeTracker: false,
    acceptTerms: false,
});
const newCategoryName = ref('');
const notificationManager = ref(null);
const apiGestor = API_gestor.getInstance();
const totalAllocated = computed(() => {
    return form.categories.reduce((sum, cat) => sum + (cat.points || 0), 0);
});
const remainingPoints = computed(() => {
    return Math.max(totalPoints - totalAllocated.value, 0);
});
const addCategory = () => {
    if (newCategoryName.value.trim() === '')
        return;
    form.categories.push({ name: newCategoryName.value.trim(), points: 1 });
    newCategoryName.value = '';
};
const removeCategory = (index) => {
    if (form.categories.length > 1) {
        form.categories.splice(index, 1);
    }
};
const submitForm = async () => {
    try {
        let errors = [];
        // Controllo campi obbligatori
        if (!form.username.trim())
            errors.push("Username is required.");
        if (!form.firstName.trim())
            errors.push("First Name is required.");
        if (!form.lastName.trim())
            errors.push("Last Name is required.");
        if (!form.email.trim())
            errors.push("Email is required.");
        if (!form.age)
            errors.push("Age is required.");
        if (!form.phone.trim())
            errors.push("Phone Number is required.");
        // Validazione email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            errors.push("Please enter a valid email address.");
        }
        // Controllo età (deve essere un numero valido e positivo)
        if (isNaN(form.age) || form.age <= 0) {
            errors.push("Please enter a valid age.");
        }
        // Controllo numero di telefono (almeno 8 cifre)
        const phoneRegex = /^\d{8,}$/;
        if (!phoneRegex.test(form.phone)) {
            errors.push("Phone Number must be at least 8 digits long.");
        }
        // Controllo allocazione dei punti
        if (remainingPoints.value !== 0) {
            errors.push(`You must allocate exactly ${totalPoints} points. Remaining points: ${remainingPoints.value}`);
        }
        //controllo punti negativi:
        for (let c of form.categories) {
            if (c.points < 1) {
                errors.push(`A category can't have less than 1 point (${c.name})`);
                break;
            }
            if (c.points > (totalPoints - form.categories.length + 1)) {
                errors.push(`Having ${form.categories.length} you can't add more than ${(totalPoints - form.categories.length + 1)} points to a single category (${c.name})`);
                break;
            }
        }
        // Controllo accettazione termini e condizioni
        if (!form.acceptTerms) {
            errors.push("You must accept the terms and conditions.");
        }
        // Se ci sono errori, mostra il primo nella notifica
        if (errors.length > 0) {
            notificationManager.value?.showNotification({
                type: "error",
                message: errors[0], // Mostra il primo errore
            });
            return;
        }
        //check username && email
        const checkResponse = await apiGestor.checkUniqueEmailAndUsername(form.email, form.username);
        console.log("checkResponse:\n", checkResponse);
        if (!checkResponse.success) {
            notificationManager.value?.showNotification({
                type: "error",
                message: checkResponse.errorMessage,
            });
            return;
        }
        // Se tutto è valido, invia il form
        console.log("Registration Form Submitted:", form);
        //registration :
        const registrationEsit = await apiGestor.registerUser(form);
        if (registrationEsit.success) {
            notificationManager.value?.showNotification({
                type: "success",
                message: "Successfully registered as " + form.username,
            });
            await delay(1500);
            notificationManager.value?.showNotification({
                type: "info",
                message: "We've sent you the license key via email, please check also the spam",
            });
        }
        else {
            console.log("error in registation:\n", registrationEsit.errorMessage);
            notificationManager.value?.showNotification({
                type: "error",
                message: registrationEsit.errorMessage,
            });
        }
    }
    catch (error) {
        console.log("error in submit form:\n", error);
        notificationManager.value?.showNotification({
            type: "error",
            message: "An error occured while submitting form, please try again",
        });
    }
};
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['carousel',];
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
    // @ts-ignore
    /** @type { [typeof NotificationManager, ] } */ ;
    // @ts-ignore
    const __VLS_0 = __VLS_asFunctionalComponent(NotificationManager, new NotificationManager({
        ref: ("notificationManager"),
    }));
    const __VLS_1 = __VLS_0({
        ref: ("notificationManager"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_0));
    // @ts-ignore navigation for `const notificationManager = ref()`
    /** @type { typeof __VLS_ctx.notificationManager } */ ;
    var __VLS_5 = {};
    var __VLS_4;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel-container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel-slide") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("text-2xl font-bold mb-4 text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-center text-sm text-gray-600 dark:text-gray-300 max-w-lg mx-auto") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel-slide") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("text-2xl font-bold mb-6 text-center") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("grid grid-cols-2 gap-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        autocomplete: ("off"),
        value: ((__VLS_ctx.form.username)),
        placeholder: ("Username"),
        ...{ class: ("baseInputField") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("email"),
        autocomplete: ("off"),
        placeholder: ("Email"),
        ...{ class: ("baseInputField") },
    });
    (__VLS_ctx.form.email);
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        autocomplete: ("off"),
        value: ((__VLS_ctx.form.firstName)),
        placeholder: ("First Name"),
        ...{ class: ("baseInputField") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        autocomplete: ("off"),
        value: ((__VLS_ctx.form.lastName)),
        placeholder: ("Last Name"),
        ...{ class: ("baseInputField") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("number"),
        autocomplete: ("off"),
        placeholder: ("Age"),
        ...{ class: ("baseInputField no-spin") },
    });
    (__VLS_ctx.form.age);
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("tel"),
        autocomplete: ("off"),
        placeholder: ("Phone Number"),
        ...{ class: ("baseInputField") },
    });
    (__VLS_ctx.form.phone);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel-slide") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("text-2xl font-bold mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("mb-4 text-sm") },
    });
    (__VLS_ctx.remainingPoints);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("grid grid-cols-5 gap-4") },
    });
    for (const [cat, index] of __VLS_getVForSourceType((__VLS_ctx.form.categories))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: ((index)),
            ...{ class: ("flex flex-col items-start p-2 rounded-lg shadow") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: ("text-sm font-semibold mb-1 self-start") },
        });
        (cat.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("flex items-center gap-2 w-26") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("number"),
            min: ((0)),
            max: ((cat.points + __VLS_ctx.remainingPoints)),
            ...{ class: ("baseInputField no-spin w-full") },
        });
        (cat.points);
        if (__VLS_ctx.form.categories.length > 1) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!((__VLS_ctx.form.categories.length > 1)))
                            return;
                        __VLS_ctx.removeCategory(index);
                    } },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("material-symbols-outlined g-icon ") },
            });
        }
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6 flex gap-2") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("text"),
        value: ((__VLS_ctx.newCategoryName)),
        placeholder: ("Add new category"),
        ...{ class: ("baseInputField flex-1") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.addCategory) },
        ...{ class: ("baseButtonHigher") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("carousel-slide") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("text-2xl font-bold mb-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("space-y-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: ("flex items-center gap-2") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("checkbox"),
        ...{ class: ("baseCheckbox") },
    });
    (__VLS_ctx.form.notifications);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: ("flex items-center gap-2") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ class: ("baseCheckbox") },
        type: ("checkbox"),
    });
    (__VLS_ctx.form.timeTracker);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-4") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: ("text-sm mb-2") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("p-2 border rounded h-18 overflow-auto text-sm ") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        ...{ class: ("flex items-center mt-2 gap-2") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        ...{ class: ("baseCheckbox") },
        type: ("checkbox"),
    });
    (__VLS_ctx.form.acceptTerms);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("mt-6") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.submitForm) },
        ...{ class: ("baseButton w-full") },
    });
    ['carousel-container', 'carousel', 'carousel-slide', 'text-2xl', 'font-bold', 'mb-4', 'text-center', 'text-center', 'text-sm', 'text-gray-600', 'dark:text-gray-300', 'max-w-lg', 'mx-auto', 'text-center', 'text-sm', 'text-gray-600', 'dark:text-gray-300', 'max-w-lg', 'mx-auto', 'text-center', 'text-sm', 'text-gray-600', 'dark:text-gray-300', 'max-w-lg', 'mx-auto', 'carousel-slide', 'text-2xl', 'font-bold', 'mb-6', 'text-center', 'grid', 'grid-cols-2', 'gap-4', 'baseInputField', 'baseInputField', 'baseInputField', 'baseInputField', 'baseInputField', 'no-spin', 'baseInputField', 'carousel-slide', 'text-2xl', 'font-bold', 'mb-6', 'mb-4', 'text-sm', 'grid', 'grid-cols-5', 'gap-4', 'flex', 'flex-col', 'items-start', 'p-2', 'rounded-lg', 'shadow', 'text-sm', 'font-semibold', 'mb-1', 'self-start', 'flex', 'items-center', 'gap-2', 'w-26', 'baseInputField', 'no-spin', 'w-full', 'material-symbols-outlined', 'g-icon', 'mt-6', 'flex', 'gap-2', 'baseInputField', 'flex-1', 'baseButtonHigher', 'carousel-slide', 'text-2xl', 'font-bold', 'mb-6', 'space-y-4', 'flex', 'items-center', 'gap-2', 'baseCheckbox', 'flex', 'items-center', 'gap-2', 'baseCheckbox', 'mt-4', 'text-sm', 'mb-2', 'p-2', 'border', 'rounded', 'h-18', 'overflow-auto', 'text-sm', 'flex', 'items-center', 'mt-2', 'gap-2', 'baseCheckbox', 'mt-6', 'baseButton', 'w-full',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'notificationManager': __VLS_5,
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
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NotificationManager: NotificationManager,
            form: form,
            newCategoryName: newCategoryName,
            notificationManager: notificationManager,
            remainingPoints: remainingPoints,
            addCategory: addCategory,
            removeCategory: removeCategory,
            submitForm: submitForm,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
});
; /* PartiallyEnd: #4569/main.vue */
