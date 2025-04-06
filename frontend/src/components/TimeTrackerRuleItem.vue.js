import { ref, watch } from 'vue';
const props = defineProps();
const emit = defineEmits(['update', 'copy', 'delete']);
// Stato locale: regola e modalità editing
const editing = ref(false);
const ruleObj = ref(props.rule);
const editedRule = ref({ ...props.rule });
// Avvia la modalità editing
function startEditing() {
    editing.value = true;
    editedRule.value = { ...ruleObj.value };
}
function cancelEditing() {
    editing.value = false;
}
function saveEdits() {
    // Validazione di base
    if (!editedRule.value.site_or_app_name.trim() || editedRule.value.minutesDailyLimit <= 0) {
        alert("Please fill all required fields correctly.");
        return;
    }
    Object.assign(ruleObj.value, editedRule.value);
    emit('update', ruleObj.value);
    editing.value = false;
}
// Se la prop cambia, aggiorna lo stato locale
watch(() => props.rule, (newVal) => {
    ruleObj.value = newVal;
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("rule-item") },
    });
    if (!__VLS_ctx.editing) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("rule-display") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("rule-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("site-name") },
        });
        (__VLS_ctx.ruleObj.site_or_app_name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("rule-type") },
        });
        (__VLS_ctx.ruleObj.rule);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("limit") },
        });
        (__VLS_ctx.ruleObj.minutesDailyLimit);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("category") },
        });
        (__VLS_ctx.ruleObj.category);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("remaining") },
        });
        (__VLS_ctx.ruleObj.remainingTimeMin);
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("rule-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.startEditing) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.editing)))
                        return;
                    __VLS_ctx.$emit('copy', __VLS_ctx.ruleObj);
                } },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((!__VLS_ctx.editing)))
                        return;
                    __VLS_ctx.$emit('delete', __VLS_ctx.ruleObj);
                } },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("material-symbols-outlined g-icon") },
        });
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("rule-edit") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((__VLS_ctx.editedRule.site_or_app_name)),
            placeholder: ("Site/App Name"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("number"),
            placeholder: ("Daily Limit (min)"),
        });
        (__VLS_ctx.editedRule.minutesDailyLimit);
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.editedRule.rule)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("only notify"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("notify & close"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
            value: ("notify, close & block"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            type: ("text"),
            value: ((__VLS_ctx.editedRule.category)),
            placeholder: ("Category"),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("edit-actions") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.saveEdits) },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.cancelEditing) },
        });
    }
    ['rule-item', 'rule-display', 'rule-info', 'site-name', 'rule-type', 'limit', 'category', 'remaining', 'rule-actions', 'material-symbols-outlined', 'g-icon', 'material-symbols-outlined', 'g-icon', 'material-symbols-outlined', 'g-icon', 'rule-edit', 'edit-actions',];
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
            editing: editing,
            ruleObj: ruleObj,
            editedRule: editedRule,
            startEditing: startEditing,
            cancelEditing: cancelEditing,
            saveEdits: saveEdits,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
